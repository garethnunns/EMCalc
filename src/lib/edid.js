class edid {
  /**
   * Written by Gareth Nunns
   * Inspired by the spreadsheet: https://www.facebook.com/groups/Barcofolsom/permalink/2524750314238262/
   * Spreadsheet credits:
   * Graham Loveridge & Syed Athar Hussain
   */

  // standard timings
  timings = {
    // top & bottom margin
    marginSize: 0.018, // (1.8%)

    // cell horizontal granularity for each reduced blanking version
    hCellGranularity: {
      1: 8, // (px)
      2: 1 // (px)
    },

    // V Sync width lines for aspect ratio
    vSyncWidth: {
      '4:3': 4,
      '16:9': 5,
      '16:10': 6,
      '5:4': 7,
      '15:9': 7,
      'CVT-RB V2': 8,
      'reserved': 9,
      'custom': 10
    },

    // H Sync width
    hSyncWidth: 0.08, // (8%)

    // analog vertical blanking limitations
    vMinSyncInterval: 550, // (μs)
    vMinBackPorch: 6, // (lines)
    vMinPorch: 3, // (lines)

    // horizontal blanking timing
    hGradient: 600, // (%/kHz)
    hOffset: 40, // (%)
    hBlankingTimeScalingFactor: 128,
    hScalingFactorWeighting: 20,

    // reduced blanking timing
    hBlanking: { // for each reduced blanking version
      1: 160, // (clocks)
      2: 80 // (clocks)
    },
    hSync: 32, // (clocks)
    vMinBlankingInterval: 460, // (μs)
    vFrontPorch: { // for each reduced blanking version
      1: 3, // (lines)
      2: 1 // (lines)
    },
    vBackPorch: { // for each reduced blanking version
      1: 6, // (lines)
      2: 6 // (lines)
    },
    clockStep: { // for each reduced blanking version
      1: .25,
      2: .001
    },
    interlaced: false
  }

  /**
   * Initialise edid class with desired properties
   * @param {number} hPx - active horizontal pixels
   * @param {number} vPx - active vertical pixels
   * @param {number} refresh - refresh rate
   * @param {boolean=false} (optional) margins - if margins are required
   * @param {boolean=true} (optional) redBlnk - if reduced blanking is required
   * @param {number=2} (optional) redBlnkV - reduce blanking version to use
   */
  constructor(hPx, vPx, refresh, margins = false, redBlnk = true, redBlnkV = 2) {
    // calculate timings
    this.timings.hGradientPrime = this.timings.hBlankingTimeScalingFactor / 256 * this.timings.hGradient
    this.timings.hOffsetPrime = 
      ( (this.timings.hOffset - this.timings.hScalingFactorWeighting) * this.timings.hBlankingTimeScalingFactor / 256 ) + this.timings.hScalingFactorWeighting
    this.timings.vMinPorchRounded = Math.floor(this.timings.vMinPorch)


    this.params = {
      hPx: hPx,
      vPx: vPx,
      margins: margins,
      refresh: refresh,
      redBlnk: redBlnk,
      redBlnkV: redBlnkV
    }
  }

  calcEdid(params = this.params) {
    // horizontal cell granularity
    var hCellGranularityRounded = Math.floor(this.timings.hCellGranularity[params.redBlnkV])

    // horizontal pixels
    var hPxRounded = Math.floor(params.hPx / hCellGranularityRounded) * hCellGranularityRounded

    // left and right margins
    var hMargin = 0
    if(params.margins) {
      hMargin = Math.floor(hPxRounded * this.timings.marginSize / hCellGranularityRounded) * hCellGranularityRounded
    }
    
    // total acitve horizontal pixels
    const hActivePx = hPxRounded + 2 * hMargin

    // required vertical field rate
    var vFieldRate = params.refresh
    if(this.timings.interlaced) {
      vFieldRate *= 2
    }

    // vertical lines per field
    var vLines = Math.floor(params.vPx)
    if(this.timings.interlaced) {
      vLines = Math.floor(params.vPx/2)
    }

    // top and bottom margins
    var vMargin = 0
    if(params.margins) {
      vMargin = Math.floor(this.timings.marginSize * vLines)
    }

    // interlace factor
    const interlace = this.timings.interlaced ? 0.5 : 0

    if(!params.redBlnk) {
      // no reduced blanking

      // estimate horizontal period (μs)
      const hEstPeriod = ((1 / vFieldRate) - this.timings.vMinSyncInterval / 1000000) / (vLines + 2 * vMargin + this.timings.vMinPorchRounded + interlace) * 1000000

      // estimate num vertical lines
      const vEstSyncBackPorch = Math.floor(this.timings.vMinSyncInterval / hEstPeriod) + 1

      // num vertical lines
      const vSyncBackPorch = Math.min(this.timings.vMinSyncInterval + this.timings.vMinBackPorch, vEstSyncBackPorch)

      // aspect ratio
      var aspect
      if(params.redBlnk && redBlnkV) {
        aspect = 'CVT-RB V2'
      }
      else {
        aspect = this.aspectRatio(params.hPx,params.vPx)
      }

      const vSync = this.timings.vSyncWidth[aspect]

      // lines in back porch
      const vBackPorch = vSyncBackPorch - this.timings.vSyncWidth[aspect]

      // total lines in vertical field
      var vTotal = vLines + 2 * vMargin + vSyncBackPorch + interlace + this.timings.vMinPorchRounded
      if(this.timings.interlaced) {
        vTotal *= 2
      }

      // ideal blanking duty cycle (%)
      const idealBlankingCycle = this.timings.hOffsetPrime - (this.timings.hGradientPrime * hEstPeriod / 1000)

      var hBlankingTime
      // find blanking time to nearest char cell
      if(idealBlankingCycle < 20) {
        hBlankingTime = Math.floor( (hActivePx * 20 / (100-20) / (2 * hCellGranularityRounded) ) ) * (2 * hCellGranularityRounded)
      }
      else {
        hBlankingTime = Math.floor(hActivePx * idealBlankingCycle / (100 - idealBlankingCycle) / (2 * hCellGranularityRounded) ) * (2 * hCellGranularityRounded)
      }

      // total horizontal pixels in lines
      const hTotal = hActivePx + hBlankingTime

      // pixel clock frequency
      const freq = hTotal / hEstPeriod

      // horizontal sync
      const hSyncRounded = Math.floor( this.timings.hSyncWidth * hTotal / hCellGranularityRounded ) * hCellGranularityRounded

      // vertical front porch
      const vFrontPorch = this.timings.vMinPorchRounded + interlace

      // process independent

      // barco links
      const links = this.calcLinks(params.hPx, freq)

      // horizontal back porch
      const hBackPorch = hBlankingTime / 2

      // horizontal front porch
      const hFrontPorch = hBlankingTime - hBackPorch - hSyncRounded

      // horizontal sync polarity
      const hPolarity = params.redBlnk

      // vertical active lines correct interlaced
      if(this.timings.interlaced) {
        vLines *= 2
      }

      // vertical sync polarity
      const vPolarity = !params.redBlnk


      return {
        links: links,
        freq: freq.toFixed(3),

        hTotal: hTotal,
        hFrontPorch: hFrontPorch,
        hActive: hPxRounded,
        hSync: hSyncRounded,
        hPolarity: hPolarity,
  
        vTotal: vTotal,
        vFrontPorch: vFrontPorch,
        vActive: vLines,
        vPolarity: vPolarity,
        vSync: vSync,
        vRate: params.refresh
      }
    }
  }

  /**
   * Returns connector capacity as a string
   * @param {number} hPx - active horizontal pixels (px)
   * @param {number} freq - pixel clock (MHz)
   * @returns {string} string value, *e.g. 'SL'*
   */
  calcLinks(hPx,freq) {
    if(hPx > 4096 && freq > 660) {
      // above 4K capacity
      return ''
    }
    if(hPx <= 2048 && freq <= 165) {
      return 'SL'
    }
    if(freq <= 330) {
      return 'DL'
    }
    
    return '4K'
  }

  /**
   * Returns the VESA aspect ratio as a string
   * @param {number} hPx - horizontal pixels
   * @param {number} vPx - vertical pixels
   * @returns {string} string value, *e.g. '4:3'*
   */
  aspectRatio(hPx, vPx) {
    switch (hPx / vPx) {
      case 4/3:
        return '4:3'
        break;
      case 16/9:
        return '16:9'
        break;
      case 16/10:
        return '16:10'
        break;
      case 5/4:
        return '5:4'
        break;
      case 15/9:
        return '15:9'
        break;
      default:
        return 'custom'
        break;
    }
  }

  /**
   * Returns possible I/O connections as object
   * @param {number} hPx - active horizontal pixels (px)
   * @param {number} hTotal - total horizontal pixels (px)
   * @param {number} freq - pixel clock (MHz)
   * @returns {Object} Object
   */
  possConns(hPx,hTotal,freq) {
    return {
      'input': {
        'dvid': hPx < 4096 && freq <= 330,
        'hdmi14': hPx < 4096 && freq <= 300,
        'hdmi20': hPx <= 4096 && freq <= 600,
        'dp11': hTotal <= 4096 && freq <= 300,
        'dp12': hPx <= 4096 && freq <= 660
      },
      'output': {
        'dvid': hPx < 4096 && freq <= 330 && hPx % 8 == 0,
        'hdmi14': hPx < 4096 && freq <= 300 && hPx % 8 == 0,
        'hdmi20': hPx <= 4096 && ( (freq <= 330 && hPx % 8 == 0) || (freq > 330 && freq < 600 && hPx % 16 == 0) ),
        'dp11': hTotal <= 4096 && freq <= 300 && hPx % 4 == 0,
        'dp12': hPx <= 4096 && ( (freq <= 330 && hPx % 8 == 0) || (freq > 330 && freq <= 660 && hPx % 16 == 0) )
      }
    }
  }
}

module.exports = edid