var FeedService = (function () {
  var maxItemsPerFeed = 5;

  return {
    downloadFeed: function (feed) {
      if (!feed.url) {
        return;
      }

      var x = new XMLHttpRequest();
      x.open("GET", feed.url);
      x.responseType = "document";
      x.onload = function () {
        var rawResponse = x.response;

        if (!rawResponse) {
          console.log("No rss feed found at " + url);
        } else {
          this.parseFeed(rawResponse, feed);
        }
      }.bind(this);
      x.onerror = function () {
        console.log("Network error.");
      };
      x.send();
    },
    parseFeed: function (rawData, existingFeedData) {
      var newFeedData = {};
      var $feedEntries =
        $(rawData).find("entry").length > 0
          ? $(rawData).find("entry")
          : $(rawData).find("item");

      $feedEntries.each(
        function (index, elm) {
          var feedEntry = {
            id: index,
            title: $(elm).find("title").text(),
            unread: true,
          };

          feedEntry.url = this.getUrlForFeed($(elm), existingFeedData);

          newFeedData[feedEntry.url] = feedEntry;

          if (index == maxItemsPerFeed - 1) {
            this.saveFeed(existingFeedData, newFeedData);
            return false;
          }
        }.bind(this)
      );
    },
    getUrlForFeed: function ($feed, feedSettings) {
      if (
        feedSettings.linkType &&
        $feed.find(feedSettings.linkType).length > 0
      ) {
        return $feed.find(feedSettings.linkType).text();
      } else if ($feed.find("link").length == 1) {
        return $feed.find("link").text();
      } else {
        if ($feed.find('link[rel="shorturl"]').length > 0) {
          return $feed.find('link[rel="shorturl"]').attr("href");
        } else if ($feed.find('link[rel="alternate"]').length > 0) {
          return $feed.find('link[rel="alternate"]').attr("href");
        } else if ($feed.find('link[rel="related"]').length > 0) {
          return $feed.find('link[rel="related"]').attr("href");
        } else {
          return $feed.find("link").first();
        }
      }
    },
    saveFeed: function (existingFeedData, newFeedData) {
      newFeedData = this.updateReadStatusOfNewItems(
        existingFeedData.items,
        newFeedData
      );

      for (var item in newFeedData) {
        if (newFeedData.hasOwnProperty(item)) {
          if (newFeedData[item].unread) {
            existingFeedData.newItems = true;
            this.setNewBadge();
          }
        }
      }

      existingFeedData.items = newFeedData;
      existingFeedData.lastUpdate = Date.now();

      Storage.saveFeedData(existingFeedData);
    },
    updateReadStatusOfNewItems: function (oldItems, newItems) {
      if (
        typeof oldItems === "undefined" ||
        Object.keys(oldItems).length == 0 ||
        Object.keys(newItems).length == 0
      ) {
        return newItems;
      }

      Object.keys(newItems).forEach(function (url) {
        if (oldItems[url]) {
          newItems[url].unread = oldItems[url].unread;
        }
      });

      return newItems;
    },
    setNewBadge: function () {
      chrome.browserAction.setBadgeText({ text: "NEW" });
    },
  };
})();
