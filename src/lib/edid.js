class edid {
  /**
   * Initialise edid class with desired properties
   * @param {number} hor - active horizontal pixels
   * @param {number} ver - active vertical pixels
   * @param {number} refresh - refresh rate
   * @param {boolean=true} (optional) redBlnk - reduce blanking
   * @param {number=1} (optional) redBlnkV - reduce blanking version
   */
  constructor(hor, ver, refresh, redBlnk = true, redBlnkV = 2) {
    this.input = {
      hor: hor,
      ver: ver,
      refresh: refresh,
      redBlnk: redBlnk,
      redBlnkV: redBlnkV
    }
  }
}

module.exports = edid;