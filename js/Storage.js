var Storage = (function () {
  return {
    getFeeds: function (callback, returnArray, sortArray) {
      returnArray = typeof returnArray !== "undefined" ? returnArray : true;
      sortArray = typeof sortArray !== "undefined" ? sortArray : true;

      chrome.storage.sync.get(
        function (dataObject) {
          var result = dataObject;

          if (returnArray) {
            var feedArray = this.parseDataObjectIntoArray(dataObject);

            result = sortArray
              ? this.sortArrayOfObjects(feedArray, "position")
              : feedArray;
          } else {
            delete result["RssR:Settings"];
          }

          callback(result);
        }.bind(this)
      );
    },
    getFeedByUrl: function (feedUrl, callback) {
      chrome.storage.sync.get(feedUrl, function (feedData) {
        callback(feedData[feedUrl]);
      });
    },
    removeFeedByUrl: function (feedUrl) {
      chrome.storage.sync.remove(feedUrl);
    },
    saveFeedData: function (feedData) {
      var saveFeed = {};
      saveFeed[feedData.url] = feedData;

      this.setDataObject(saveFeed);
    },
    parseDataObjectIntoArray: function (object) {
      var array = [];

      Object.keys(object).forEach(function (objectKey) {
        if (objectKey.indexOf("RssR:Settings") !== 0) {
          array.push(object[objectKey]);
        }
      });

      return array;
    },
    sortArrayOfObjects: function (array, sortKey) {
      array.sort(function (a, b) {
        if (typeof a[sortKey] === "undefined") {
          return true;
        } else if (typeof b[sortKey] === "undefined") {
          return false;
        }
        return a[sortKey] - b[sortKey];
      });

      return array;
    },
    clearAllData: function () {
      chrome.storage.sync.clear();
    },
    setDataObject: function (dataObject) {
      chrome.storage.sync.set(dataObject);
    },
  };
})();
