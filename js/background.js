chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name == 'updateRssFeeds')
    {
        updateRssFeeds();
    }
});

chrome.runtime.onInstalled.addListener(onInstall);

function onInstall({ reason })
{
    if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.runtime.openOptionsPage();
    }
    
    chrome.alarms.create('updateRssFeeds', {when: 0, periodInMinutes: 15});
}

function updateRssFeeds()
{
    Storage.getFeeds(function(feeds) {
        feeds.forEach(function(feed) {
            FeedService.downloadFeed(feed);
        });
    }, true, false)
}