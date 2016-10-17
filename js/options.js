function restoreFeedList() {
    var $rssFeedList = $('ul[data-feed-list]');
    $rssFeedList.html('');

    Storage.getFeeds(function(feeds) {
        if (feeds.length > 0)
        {
            feeds.forEach(function(feed) {
                var $listItem = $('<li data-feed-element>'
                                +   '<span class="sortHandle icon-menu" data-role="sortHandle"></span>'
                                +   '<span data-feed-name></span>'
                                + '</li>');

                $listItem.data('feedUrl', feed.url).find('span[data-feed-name]').text(feed.name);

                $rssFeedList.append($listItem);
            });
        }
        else
        {
            $rssFeedList.append('<li id="newFeedCta">Add new feeds below!</li>');
        }
    }, true);
}

function initializeOptions() {
    restoreFeedList();

    Sortable.create(document.getElementById('feedList'), {
        handle: '.sortHandle',
        animation: 150,
        onEnd: handleSortEnd
    });

    initEventHandlers();
}

function saveSortOrder()
{
    Storage.getFeeds(function(feedsObject) {
        $('ul[data-feed-list]').find('li[data-feed-element]').each(function(index, elm) {
            var feedUrl = $(elm).data('feedUrl');
            var feedData = feedsObject[feedUrl];
            feedData.position = index;

            if (feedData)
            {
                Storage.saveFeedData(feedData);
            }
        });
    }, false);
}

function initEventHandlers()
{
    $('button[data-role="saveEditForm"]').on('click', handleSaveClick);

    $('button[data-role="cancelEditForm"]').on('click', handleCancelClick);

    $('button[data-role="removeFeed"]').on('click', handleRemoveClick);

    $('button[data-role="editSortOrder"]').on('click', handleSortClick);

    $('button[data-role="addNewFeed"]').on('click', handleNewFeedClick);

    $('ul[data-feed-list]').on('click', 'li[data-feed-element]', handleEditFeedClick);
}

function handleSortEnd(event)
{
    if (event.oldIndex != event.newIndex)
    {
        $('button[data-role="editSortOrder"]').data('needToSave', true);
    }
}

function handleSortClick(event)
{
    clearSelectedFeed();
    var $btn = $(event.target);
    var isSorting = $btn.data('sorting');

    if (isSorting)
    {
        $('[data-role="sortHandle"]').hide();

        if ($btn.data('needToSave'))
        {
            saveSortOrder();
            $btn.data('needToSave', false);
        }
        $btn.text('Edit Order');
    }
    else
    {
        $('span[data-role="sortHandle"]').css('display', 'inline-block');
        $('div[data-edit-pane]').hide();
        $('div[data-general-settings-pane]').show();
        $btn.text('Save Order');
    }

    $btn.data('sorting', !isSorting);
    $('button[data-role="addNewFeed"]').toggle();
}

function handleCancelClick()
{
    clearSelectedFeed();
    toggleEditPane();
}

function handleNewFeedClick()
{
    clearSelectedFeed();
    resetAndShowEditPane();
}

function handleRemoveClick(event)
{
    var feedUrl = $(event.target).data('feedUrl');

    if (feedUrl)
    {
        Storage.removeFeedByUrl(feedUrl);
        restoreFeedList();
    }

    toggleEditPane();
}

function toggleEditPane()
{
    $('div[data-edit-pane]').toggle();
    $('div[data-general-settings-pane]').toggle();
}

function handleEditFeedClick(event)
{
    if ($(event.currentTarget).hasClass('selected') || $('button[data-role="editSortOrder"]').data('sorting'))
    {
        return;
    }

    clearSelectedFeed();
    var $elm = $(event.currentTarget).addClass('selected');

    Storage.getFeedByUrl($elm.data('feedUrl'), function(feed) {
        resetAndShowEditPane(feed);
    });
}

function handleSaveClick(event)
{
    var $form = $(event.target).closest('div[data-edit-form]');

    var feedData = $(event.target).data('feedData') || {url: '', position: -1};
    var prevUrl = feedData.url.trim();

    feedData.name = $form.find('input[data-feed-name]').val().trim();
    feedData.url = $form.find('input[data-feed-url]').val().trim();
    feedData.linkType = $form.find('select[data-link-type]').val();

    if (feedData.name && feedData.url)
    {
        if (prevUrl && prevUrl != feedData.url)
        {
            Storage.removeFeedByUrl(prevUrl);
        }

        Storage.saveFeedData(feedData);
        FeedService.downloadFeed(feedData);

        restoreFeedList();

        toggleEditPane();
    }
}

function resetAndShowEditPane(feed)
{
    var editing = Boolean(feed);

    feed = feed || {name: '', url: '', linkType: ''};

    var $editPane = $('div[data-edit-pane]');
    $editPane.find('span[data-edit-header-label]').text(feed.url ? 'Edit' : 'Add a');
    $editPane.find('input[data-feed-name]').val(feed.name);
    $editPane.find('input[data-feed-url]').val(feed.url);

    if (editing)
    {
        $editPane.find('select[data-link-type]').find('option[value="' + feed.linkType + '"]').prop('selected', true);
        $editPane.find('button[data-role="saveEditForm"]').data('feedData', feed);
        $editPane.find('button[data-role="removeFeed"]').data('feedUrl', feed.url).show();
    }
    else
    {
        $editPane.find('select[data-link-type]').find('option').prop('selected', false);
        $editPane.find('button[data-role="saveEditForm"]').data('feedData', false);
        $editPane.find('button[data-role="removeFeed"]').data('feedUrl', false).hide();
    }

    $('div[data-general-settings-pane]').hide();
    $editPane.show();
}

function clearSelectedFeed()
{
    var $feedList = $('ul[data-feed-list]');

    $feedList.find('li[data-feed-element]').removeClass('selected');
}

document.addEventListener('DOMContentLoaded', initializeOptions);