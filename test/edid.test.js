const assert = require('assert')
import edid from './../src/lib/edid'

describe('Constuctor', () => {
  const constEdid = new edid(1920,1080,60,false,true,2)

  it('set params', () => {
    assert.equal(constEdid.params.hPx, 1920)
    assert.equal(constEdid.params.vPx, 1080)
    assert.equal(constEdid.params.refresh, 60)
    assert.equal(constEdid.params.margins, false)
    assert.equal(constEdid.params.redBlnk, true)
    assert.equal(constEdid.params.redBlnkV, 2)
  })

  it('warning strings', () => {
    // check the defined warnings say the right thing
    // then just refer to the defined warnings in other tests
    // then only one test to update

    const warningsEdid = new edid()

    assert.equal(warningsEdid.warnings.hRounded, "Horizontal pixel count rounded to nearest character cell")
    assert.equal(warningsEdid.warnings.vRounded, "Vertical pixel count rounded to nearest integer")
    assert.equal(warningsEdid.warnings.aspect, "Aspect ratio is not a CVT standard")
    assert.equal(warningsEdid.warnings.refresh, "Refresh rate is not a CVT standard")
    assert.equal(warningsEdid.warnings.redBlnkRefresh, "60Hz recommended for reduced blanking v1")

    // links notes
    assert.equal(warningsEdid.warnings.links.sl, 'Single Link Signal Bandwidth')
    assert.equal(warningsEdid.warnings.links.dl, 'Dual Link Signal Bandwidth')
    assert.equal(warningsEdid.warnings.links.gen1, 'Pixel Clock too high for all Gen 1 Cards')
    assert.equal(warningsEdid.warnings.links.all, 'Pixel Clock too high for all cards')

    // frequency notes
    assert.equal(warningsEdid.warnings.freq.above300, 'Above HDMI 1.4 & DP 1.1 spec')
    assert.equal(warningsEdid.warnings.freq.above330, 'Above DVI, HDMI 1.4 and DP 1.1 spec')
    assert.equal(warningsEdid.warnings.freq.dp12, 'DisplayPort 1.2 Only')
    assert.equal(warningsEdid.warnings.freq.all, 'Not supported on any single connector')
  })
})

describe('Calculate EDID', () => {
  it('1920x1080@60 // no margins // no reduced blanking // v1', () => {
    const calcEdid = new edid(1920,1080,60,false,false,1)

    const result = calcEdid.calcEdid()

    assert.equal(result.links, 'DL')
    assert.equal(result.linksNote, calcEdid.warnings.links.dl)

    assert.equal(result.freq, 173.101)
    assert.equal(result.freqNote, '')

    assert.equal(result.hTotal, 2576)
    assert.equal(result.hFrontPorch, 128)
    assert.equal(result.hActive, 1920)
    assert.equal(result.hSync, 200)
    assert.equal(result.hPolarity, false)

    assert.equal(result.vTotal, 1120)
    assert.equal(result.vFrontPorch, 3)
    assert.equal(result.vActive, 1080)
    assert.equal(result.vSync, 5)
    assert.equal(result.vPolarity, true)
    assert.equal(result.vRate, 60)

    const expectedPossConns = {
      input: {
        dvid: true,
        dp11: true,
        hdmi14: true,
        dp12: true,
        hdmi20: true
      },
      output: {
        dvid: true,
        dp11: true,
        hdmi14: true,
        dp12: true,
        hdmi20: true
      }
    }

    assert.deepEqual(result.possConns,expectedPossConns)

    assert.equal(result.warnings.length, 0)
  })

  it('4096x2160@30 // margins // no reduced blanking // v2', () => {
    const calcEdid = new edid(4096,2160,30,true,false,2)

    const result = calcEdid.calcEdid()

    assert.equal(result.links, '4K')
    assert.equal(result.linksNote, calcEdid.warnings.links.gen1)

    assert.equal(result.freq, 389.429)
    assert.equal(result.freqNote, calcEdid.warnings.freq.above330)

    assert.equal(result.hTotal, 5702)
    assert.equal(result.hFrontPorch, 274)
    assert.equal(result.hActive, 4096)
    assert.equal(result.hSync, 456)
    assert.equal(result.hPolarity, false)

    assert.equal(result.vTotal, 2277)
    assert.equal(result.vFrontPorch, 3)
    assert.equal(result.vActive, 2160)
    assert.equal(result.vSync, 10)
    assert.equal(result.vPolarity, true)
    assert.equal(result.vRate, 30)

    const expectedPossConns = {
      input: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: true,
        hdmi20: true
      },
      output: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: true,
        hdmi20: true
      }
    }

    assert.deepEqual(result.possConns,expectedPossConns)

    assert.equal(result.warnings.length, 2)
    assert(result.warnings.includes(calcEdid.warnings.aspect))
    assert(result.warnings.includes(calcEdid.warnings.refresh))
  })

  it('3840x2160@60 // margins // reduced blanking // v2', () => {
    const calcEdid = new edid(3840,2160,60,true,true,2)

    const result = calcEdid.calcEdid()

    assert.equal(result.links, '4K')
    assert.equal(result.linksNote, calcEdid.warnings.links.gen1)

    assert.equal(result.freq, 560.004)
    assert.equal(result.freqNote, calcEdid.warnings.freq.above330)

    assert.equal(result.hTotal, 4058)
    assert.equal(result.hFrontPorch, 8)
    assert.equal(result.hActive, 3840)
    assert.equal(result.hSync, 32)
    assert.equal(result.hPolarity, true)

    assert.equal(result.vTotal, 2300)
    assert.equal(result.vFrontPorch, 50)
    assert.equal(result.vActive, 2160)
    assert.equal(result.vSync, 8)
    assert.equal(result.vPolarity, false)
    assert.equal(result.vRate, 60)

    const expectedPossConns = {
      input: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: true,
        hdmi20: true
      },
      output: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: true,
        hdmi20: true
      }
    }

    assert.deepEqual(result.possConns,expectedPossConns)

    assert.equal(result.warnings.length, 0)
  })
})

describe('Link Capacity', () => {
  const linkEdid = new edid()

  it('single link', () => {
    assert.equal(linkEdid.calcLinks(1920,133.320), 'SL')
  })

  it('single link - low edge case', () => {
    assert.equal(linkEdid.calcLinks(2048,141.852), 'SL')
    assert.equal(linkEdid.calcLinks(1920,165.000), 'SL')
  })

  it('dual link', () => {
    assert.equal(linkEdid.calcLinks(2560,251.289), 'DL')
  })
  it('dual link - low edge case', () => {
    assert.equal(linkEdid.calcLinks(1280,250.000), 'DL')
    assert.equal(linkEdid.calcLinks(1280,165.001), 'DL')
    assert.equal(linkEdid.calcLinks(2560,164.000), 'DL')
  })
  it('dual link - high edge case', () => {
    assert.equal(linkEdid.calcLinks(2560,330.000), 'DL')
    assert.equal(linkEdid.calcLinks(4096,200.000), 'DL')
    assert.equal(linkEdid.calcLinks(4096,330.000), 'DL')
  })

  it('4K', () => {
    assert.equal(linkEdid.calcLinks(2560,400.000), '4K')
  })

  it('4K - low edge case', () => {
    assert.equal(linkEdid.calcLinks(2560,330.001), '4K')
  })

  it('4K - high edge case', () => {
    assert.equal(linkEdid.calcLinks(2560,660.000), '4K')
    assert.equal(linkEdid.calcLinks(4096,500.000), '4K')
  })

  it('Over 4K', () => {
    assert.equal(linkEdid.calcLinks(2560,661.000), 'Over 4K')
    assert.equal(linkEdid.calcLinks(4097,500.000), 'Over 4K')
  })
})

describe('Aspect Ratio', () => {
  const aspectEdid = new edid()

  it('1024x768 => 4:3', () => {
    assert.equal(aspectEdid.aspectRatio(1024,768), '4:3')
  })
  it('1920x1080 => 16:9', () => {
    assert.equal(aspectEdid.aspectRatio(1920,1080), '16:9')
  })
  it('1920x1200 => 16:10', () => {
    assert.equal(aspectEdid.aspectRatio(1920,1200), '16:10')
  })
  it('1280x1024 => 5:4', () => {
    assert.equal(aspectEdid.aspectRatio(1280,1024), '5:4')
  })
  it('1500x900 => 15:9', () => {
    assert.equal(aspectEdid.aspectRatio(1500,900), '15:9')
  })
})

describe('Possible Connections', () => {
  const connsEdid = new edid()

  it('1920 @ 180MHz', () => {
    const result = connsEdid.possConns(1920,2576,180.000)

    const expectedPossConns = {
      input: {
        dvid: true,
        dp11: true,
        hdmi14: true,
        dp12: true,
        hdmi20: true
      },
      output: {
        dvid: true,
        dp11: true,
        hdmi14: true,
        dp12: true,
        hdmi20: true
      }
    }

    assert.deepEqual(result,expectedPossConns)
  })

  it('4096 @ 300MHz', () => {
    const result = connsEdid.possConns(4096,4176,300.000)

    const expectedPossConns = {
      input: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: true,
        hdmi20: true
      },
      output: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: true,
        hdmi20: true
      }
    }

    assert.deepEqual(result,expectedPossConns)
  })

  it('4096 @ 300MHz', () => {
    const result = connsEdid.possConns(4096,4176,300.000)

    const expectedPossConns = {
      input: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: true,
        hdmi20: true
      },
      output: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: true,
        hdmi20: true
      }
    }

    assert.deepEqual(result,expectedPossConns)
  })

  it('4088 @ 305MHz', () => {
    const result = connsEdid.possConns(4088,4168,305.000)

    const expectedPossConns = {
      input: {
        dvid: true,
        dp11: false,
        hdmi14: false,
        dp12: true,
        hdmi20: true
      },
      output: {
        dvid: true,
        dp11: false,
        hdmi14: false,
        dp12: true,
        hdmi20: true
      }
    }

    assert.deepEqual(result,expectedPossConns)
  })

  it('4095 @ 300MHz', () => {
    const result = connsEdid.possConns(4095,4175,300.000)

    const expectedPossConns = {
      input: {
        dvid: true,
        dp11: false,
        hdmi14: true,
        dp12: true,
        hdmi20: true
      },
      output: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: false,
        hdmi20: false
      }
    }

    assert.deepEqual(result,expectedPossConns)
  })

  it('3996 @ 300MHz', () => {
    const result = connsEdid.possConns(3996,4076,300.000)

    const expectedPossConns = {
      input: {
        dvid: true,
        dp11: true,
        hdmi14: true,
        dp12: true,
        hdmi20: true
      },
      output: {
        dvid: false,
        dp11: true,
        hdmi14: false,
        dp12: false,
        hdmi20: false
      }
    }

    assert.deepEqual(result,expectedPossConns)
  })

  it('2560 @ 600MHz', () => {
    const result = connsEdid.possConns(2560,2640,600.000)

    const expectedPossConns = {
      input: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: true,
        hdmi20: true
      },
      output: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: true,
        hdmi20: false
      }
    }

    assert.deepEqual(result,expectedPossConns)
  })

  it('2560 @ 661MHz', () => {
    const result = connsEdid.possConns(2560,2640,661.000)

    const expectedPossConns = {
      input: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: false,
        hdmi20: false
      },
      output: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: false,
        hdmi20: false
      }
    }

    assert.deepEqual(result,expectedPossConns)
  })

  it('4097 @ 100MHz', () => {
    const result = connsEdid.possConns(4097,4177,100.000)

    const expectedPossConns = {
      input: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: false,
        hdmi20: false
      },
      output: {
        dvid: false,
        dp11: false,
        hdmi14: false,
        dp12: false,
        hdmi20: false
      }
    }

    assert.deepEqual(result,expectedPossConns)
  })
})

describe('Links Note', () => {
  const linksNoteEdid = new edid()

  it('Single Link Signal Bandwidth', () => {
    assert.equal(linksNoteEdid.linksNote(100), linksNoteEdid.warnings.links.sl)
    assert.equal(linksNoteEdid.linksNote(164), linksNoteEdid.warnings.links.sl)
  })

  it('Dual Link Signal Bandwidth', () => {
    assert.equal(linksNoteEdid.linksNote(165), linksNoteEdid.warnings.links.dl)
    assert.equal(linksNoteEdid.linksNote(200), linksNoteEdid.warnings.links.dl)
    assert.equal(linksNoteEdid.linksNote(330), linksNoteEdid.warnings.links.dl)
  })

  it('Pixel Clock too high for all Gen 1 Cards', () => {
    assert.equal(linksNoteEdid.linksNote(331), linksNoteEdid.warnings.links.gen1)
    assert.equal(linksNoteEdid.linksNote(400), linksNoteEdid.warnings.links.gen1)
    assert.equal(linksNoteEdid.linksNote(660), linksNoteEdid.warnings.links.gen1)
  })

  it('Pixel Clock too high for all cards', () => {
    assert.equal(linksNoteEdid.linksNote(661), linksNoteEdid.warnings.links.all)
    assert.equal(linksNoteEdid.linksNote(1000), linksNoteEdid.warnings.links.all)
  })
})

describe('Frequency Note', () => {
  const freqNoteEdid = new edid()

  it('No note', () => {
    assert.equal(freqNoteEdid.freqNote(150), '')
    assert.equal(freqNoteEdid.freqNote(300), '')
  })

  it('Above HDMI 1.4 & DP 1.1 spec', () => {
    assert.equal(freqNoteEdid.freqNote(301), freqNoteEdid.warnings.freq.above300)
    assert.equal(freqNoteEdid.freqNote(315), freqNoteEdid.warnings.freq.above300)
    assert.equal(freqNoteEdid.freqNote(330), freqNoteEdid.warnings.freq.above300)
  })

  it('Above DVI, HDMI 1.4 and DP 1.1 spec', () => {
    assert.equal(freqNoteEdid.freqNote(331), freqNoteEdid.warnings.freq.above330)
    assert.equal(freqNoteEdid.freqNote(450), freqNoteEdid.warnings.freq.above330)
    assert.equal(freqNoteEdid.freqNote(600), freqNoteEdid.warnings.freq.above330)
  })

  it('DisplayPort 1.2 Only', () => {
    assert.equal(freqNoteEdid.freqNote(601), freqNoteEdid.warnings.freq.dp12)
    assert.equal(freqNoteEdid.freqNote(630), freqNoteEdid.warnings.freq.dp12)
    assert.equal(freqNoteEdid.freqNote(660), freqNoteEdid.warnings.freq.dp12)
  })

  it('Not supported on any single connector', () => {
    assert.equal(freqNoteEdid.freqNote(661), freqNoteEdid.warnings.freq.all)
    assert.equal(freqNoteEdid.freqNote(1000), freqNoteEdid.warnings.freq.all)
  })
})