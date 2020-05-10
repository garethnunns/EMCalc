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