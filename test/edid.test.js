const assert = require('assert');
const edid = require('./../src/lib/edid')

describe('Constuctor', () => {
  const constEdid = new edid(1920,1080,60,true,2)

  it('should set horizontal pixels', () => {
    assert.equal(constEdid.input.hor, 1920);
  });
  it('should set vertical pixels', () => {
    assert.equal(constEdid.input.ver, 1080);
  });
  it('should set refresh rate', () => {
    assert.equal(constEdid.input.refresh, 60);
  });
  it('should set reduced blanking', () => {
    assert.equal(constEdid.input.redBlnk, true);
  });
  it('should set reduced blanking version', () => {
    assert.equal(constEdid.input.redBlnkV, 2);
  });
});