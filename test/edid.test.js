const assert = require('assert');
const edid = require('./../src/lib/edid')

describe('Constuctor', () => {
  const constEdid = new edid(1920,1080,60,true,2)

  it('should set horizontal pixels', () => {
    assert.equal(constEdid.params.hor, 1920);
  });
  it('should set vertical pixels', () => {
    assert.equal(constEdid.params.ver, 1080);
  });
  it('should set refresh rate', () => {
    assert.equal(constEdid.params.refresh, 60);
  });
  it('should set reduced blanking', () => {
    assert.equal(constEdid.params.redBlnk, true);
  });
  it('should set reduced blanking version', () => {
    assert.equal(constEdid.params.redBlnkV, 2);
  });
});