const assert = require('assert')
const edid = require('./../src/lib/edid')

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
})

describe('Calculate EDID', () => {
  it('1920x1080@60 // no margins // no reduced blanking // v1', () => {
    const calcEdid = new edid(1920,1080,60,false,false,1)

    const result = calcEdid.calcEdid()

    assert.equal(result.links, 'DL')

    assert.equal(result.freq, 173.101)

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
  })

  it('4096x2160@30 // margins // no reduced blanking // v2', () => {
    const calcEdid = new edid(4096,2160,30,true,false,2)

    const result = calcEdid.calcEdid()

    assert.equal(result.links, '4K')

    assert.equal(result.freq, 389.429)

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
  })

  it('3840x2160@60 // margins // reduced blanking // v2', () => {
    const calcEdid = new edid(3840,2160,60,true,true,2)

    const result = calcEdid.calcEdid()

    assert.equal(result.links, '4K')

    assert.equal(result.freq, 560.004)

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
  })
})

describe('Link Capacity', () => {
  const linkEdid = new edid(1920,1080,60,true,2)

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
  const aspectEdid = new edid(1920,1080,60,true,2)

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
  const connsEdid = new edid(1920,1080,60,true,2)

  it('1920 @ 180MHz', () => {
    const conns = connsEdid.possConns(1920,2576,180.000)

    assert.equal(conns.input.dvid, true)
    assert.equal(conns.input.hdmi14, true)
    assert.equal(conns.input.hdmi20, true)
    assert.equal(conns.input.dp11, true)
    assert.equal(conns.input.dp12, true)

    assert.equal(conns.output.dp11, true)
    assert.equal(conns.output.hdmi14, true)
    assert.equal(conns.output.hdmi20, true)
    assert.equal(conns.output.dp12, true)
    assert.equal(conns.output.dvid, true)
  })

  it('4096 @ 300MHz', () => {
    const conns = connsEdid.possConns(4096,4176,300.000)

    assert.equal(conns.input.dvid, false)
    assert.equal(conns.input.hdmi14, false)
    assert.equal(conns.input.hdmi20, true)
    assert.equal(conns.input.dp11, false)
    assert.equal(conns.input.dp12, true)

    assert.equal(conns.output.dvid, false)
    assert.equal(conns.output.hdmi14, false)
    assert.equal(conns.output.hdmi20, true)
    assert.equal(conns.output.dp11, false)
    assert.equal(conns.output.dp12, true)
  })

  it('4096 @ 300MHz', () => {
    const conns = connsEdid.possConns(4096,4176,300.000)

    assert.equal(conns.input.dvid, false)
    assert.equal(conns.input.hdmi14, false)
    assert.equal(conns.input.hdmi20, true)
    assert.equal(conns.input.dp11, false)
    assert.equal(conns.input.dp12, true)

    assert.equal(conns.output.dvid, false)
    assert.equal(conns.output.hdmi14, false)
    assert.equal(conns.output.hdmi20, true)
    assert.equal(conns.output.dp11, false)
    assert.equal(conns.output.dp12, true)
  })

  it('4088 @ 305MHz', () => {
    const conns = connsEdid.possConns(4088,4168,305.000)

    assert.equal(conns.input.dvid, true)
    assert.equal(conns.input.hdmi14, false)
    assert.equal(conns.input.hdmi20, true)
    assert.equal(conns.input.dp11, false)
    assert.equal(conns.input.dp12, true)

    assert.equal(conns.output.dvid, true)
    assert.equal(conns.output.hdmi14, false)
    assert.equal(conns.output.hdmi20, true)
    assert.equal(conns.output.dp11, false)
    assert.equal(conns.output.dp12, true)
  })

  it('4095 @ 300MHz', () => {
    const conns = connsEdid.possConns(4095,4175,300.000)

    assert.equal(conns.input.dvid, true)
    assert.equal(conns.input.hdmi14, true)
    assert.equal(conns.input.hdmi20, true)
    assert.equal(conns.input.dp11, false)
    assert.equal(conns.input.dp12, true)

    assert.equal(conns.output.dvid, false)
    assert.equal(conns.output.hdmi14, false)
    assert.equal(conns.output.hdmi20, false)
    assert.equal(conns.output.dp11, false)
    assert.equal(conns.output.dp12, false)
  })

  it('3996 @ 300MHz', () => {
    const conns = connsEdid.possConns(3996,4076,300.000)

    assert.equal(conns.input.dvid, true)
    assert.equal(conns.input.hdmi14, true)
    assert.equal(conns.input.hdmi20, true)
    assert.equal(conns.input.dp11, true)
    assert.equal(conns.input.dp12, true)

    assert.equal(conns.output.dvid, false)
    assert.equal(conns.output.hdmi14, false)
    assert.equal(conns.output.hdmi20, false)
    assert.equal(conns.output.dp11, true)
    assert.equal(conns.output.dp12, false)
  })

  it('2560 @ 600MHz', () => {
    const conns = connsEdid.possConns(2560,2640,600.000)

    assert.equal(conns.input.dvid, false)
    assert.equal(conns.input.hdmi14, false)
    assert.equal(conns.input.hdmi20, true)
    assert.equal(conns.input.dp11, false)
    assert.equal(conns.input.dp12, true)

    assert.equal(conns.output.dvid, false)
    assert.equal(conns.output.hdmi14, false)
    assert.equal(conns.output.hdmi20, false)
    assert.equal(conns.output.dp11, false)
    assert.equal(conns.output.dp12, true)
  })

  it('2560 @ 661MHz', () => {
    const conns = connsEdid.possConns(2560,2640,661.000)

    assert.equal(conns.input.dvid, false)
    assert.equal(conns.input.hdmi14, false)
    assert.equal(conns.input.hdmi20, false)
    assert.equal(conns.input.dp11, false)
    assert.equal(conns.input.dp12, false)

    assert.equal(conns.output.dvid, false)
    assert.equal(conns.output.hdmi14, false)
    assert.equal(conns.output.hdmi20, false)
    assert.equal(conns.output.dp11, false)
    assert.equal(conns.output.dp12, false)
  })

  it('4097 @ 100MHz', () => {
    const conns = connsEdid.possConns(4097,4177,100.000)

    assert.equal(conns.input.dvid, false)
    assert.equal(conns.input.hdmi14, false)
    assert.equal(conns.input.hdmi20, false)
    assert.equal(conns.input.dp11, false)
    assert.equal(conns.input.dp12, false)

    assert.equal(conns.output.dvid, false)
    assert.equal(conns.output.hdmi14, false)
    assert.equal(conns.output.hdmi20, false)
    assert.equal(conns.output.dp11, false)
    assert.equal(conns.output.dp12, false)
  })
});