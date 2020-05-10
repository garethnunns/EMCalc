const assert = require('assert');
const edid = require('./../src/lib/edid')

describe('Constuctor', () => {
  const constEdid = new edid(1920,1080,60,true,2)

  it('should set horizontal pixels', () => {
    assert.equal(constEdid.params.hor, 1920);
  });
  it('should set vertical pixels', () => {
    assert.equal(constEdid.params.ver, 1080);
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