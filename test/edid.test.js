const assert = require('assert');
const edid = require('./../src/lib/edid')

describe('Constuctor', () => {
  const constEdid = new edid(1920,1080,60,false,true,2)

  it('should set params', () => {
    assert.equal(constEdid.params.hPx, 1920)
    assert.equal(constEdid.params.vPx, 1080);
    assert.equal(constEdid.params.refresh, 60);
    assert.equal(constEdid.params.margins, false);
    assert.equal(constEdid.params.redBlnk, true);
    assert.equal(constEdid.params.redBlnkV, 2);
  });
});

describe('Calculate EDID', () => {
  it('1920x1080@60 // no margins // no reduced blanking', () => {
    const calcEdid = new edid(1920,1080,60,false,false,2)

    var result = calcEdid.calculateEdid()
    
    console.log(result)

    assert.equal(result.hTotalPx, 2578);
    assert.equal(result.hFrontPorch, 123);
    assert.equal(result.hActive, 1920);
    assert.equal(result.hSync, 206);
    assert.equal(result.hPolarity, false);

    assert.equal(result.vTotalLines, 1120);
    assert.equal(result.vFrontPorch, 3);
    assert.equal(result.vActive, 1080);
    assert.equal(result.vPolarity, true);
    assert.equal(result.vSync, 5);
    assert.equal(result.vRate, 60);
    
  });
});
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
})

describe('Aspect Ratio', () => {
  const aspectEdid = new edid(1920,1080,60,true,2)

  it('1024x768 => 4:3', () => {
    assert.equal(aspectEdid.aspectRatio(1024,768), '4:3');
  });
  it('1920x1080 => 16:9', () => {
    assert.equal(aspectEdid.aspectRatio(1920,1080), '16:9');
  });
  it('1920x1200 => 16:10', () => {
    assert.equal(aspectEdid.aspectRatio(1920,1200), '16:10');
  });
  it('1280x1024 => 5:4', () => {
    assert.equal(aspectEdid.aspectRatio(1280,1024), '5:4');
  });
  it('1500x900 => 15:9', () => {
    assert.equal(aspectEdid.aspectRatio(1500,900), '15:9');
  });
});