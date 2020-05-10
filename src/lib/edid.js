class edid {
  // standard timings
  timings = {
    // top & bottom margin
    marginSize: 1.8, // (%)

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
      'Reserved': 9,
      'Custom': 10
    },

    // H Sync width
    hSyncWidth: 8, // (%)

    // analog vertical blanking limitations
    vMinSyncInterval: 550, // (μs)
    vMinBackPorch: 6, // (lines)
    vMinPorch: 3, // (lines)

    // horizontal blanking timing
    hGradient: 600, // (%/kHz)
    hOffset: 40, // (%)
    hBlankingTimeScalingFactor: 128,
    hScalingFactorWeighting: 20,

    //TODO
    hGradientDash: this.timings.hGradient + this.timings.hOffset,

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
    }
  }

  /**
   * Initialise edid class with desired properties
   * @param {number} hor - active horizontal pixels
   * @param {number} ver - active vertical pixels
   * @param {number} refresh - refresh rate
   * @param {boolean=true} (optional) redBlnk - reduce blanking
   * @param {number=2} (optional) redBlnkV - reduce blanking version
   */
  constructor(hor, ver, refresh, redBlnk = true, redBlnkV = 2) {
    this.params = {
      hor: hor,
      ver: ver,
      refresh: refresh,
      redBlnk: redBlnk,
      redBlnkV: redBlnkV
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
   * @param {number} hPix - horizontal pixels
   * @param {number} vPix - vertical pixels
   * @returns {string}
   */
  aspectRatio(hPix, vPix) {
    switch (hPix / vPix) {
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
}

module.exports = edid