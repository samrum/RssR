function addRssRows()
{
    Storage.getFeeds(function(feeds) {
        if (feeds.length > 0)
        {
            feeds.forEach(function(feed) {
                buildFeedRow(feed, function($row) {
                    var $feedContainer = $('[data-feed-container]');

                    $feedContainer.append($row);

                    if (feed.newItems)
                    {
                        var $lastFeedArticles = $feedContainer.find('.feedArticles').last();

                        if ($lastFeedArticles.find('.feedArticle.hidden').length > 0)
                        {
                            $lastFeedArticles.append('<div class="showRead" data-role="showRead">Show Read</div>');
                        }
                    }

                    markFeedAsRead(feed);
                });
            });
        }
        else
        {
            buildOptionsPrompt();
        }
    });
}

function addClickHandlers()
{
    $(document).on('click', '[data-role="feedToggle"]', function() {
        $(this).next('.feedArticles').toggle();
    });

    $(document).on('click', '[data-role="articleLink"]', function(event) {
        event.preventDefault();

        chrome.tabs.create({
            url: $(this).attr('href'),
            active: event.which == 2
        });
    });

    $(document).on('click', '[data-role="showRead"]', function() {
        $(this).closest('.feedArticles').find('.feedArticle.hidden').show();
        $(this).hide();
    });

    $(document).on('click', '[data-role="optionsLink"]', function() {
        chrome.runtime.openOptionsPage();
    })
}

function buildFeedRow(feed, callback)
{
    var $row = $('<div class="feedRow">'
               +   '<div class="feedTitle" data-role="feedToggle"></div>'
               + '</div>'
    );

    $row.find('[data-role="feedToggle"]').text(feed.name);

    buildArticleList(feed.items, feed.newItems, function(articleListHtml) {
        $row.append(articleListHtml);
        callback($row);
    });
}

function buildArticleList(items, newItemsFound, callback)
{
    var openClass = newItemsFound ? 'opened' : '';
    var $articleList = $('<div class="feedArticles ' + openClass + '"></div>');

    if (items)
    {
        Storage.sortArrayOfObjects(Storage.parseDataObjectIntoArray(items), 'id').forEach(function(item) {
            $articleList.append(buildArticle(item, newItemsFound));
        });
    }

    callback($articleList);
}

function buildArticle(article, newItemsFound)
{
    var unreadClass = article.unread ? 'unread' : '';
    var hiddenClass = newItemsFound && !article.unread ? 'hidden' : '';

    var $article = $('<div class="feedArticle ' + unreadClass + hiddenClass + '">'
                   +   '<a data-role="articleLink"></a>'
                   + '</div>');

    $article.find('a').attr('title', article.title).attr('href', article.url).text(article.title);

    return $article;
}

function markFeedAsRead(feed)
{
    feed.newItems = false;

    for (var itemKey in feed.items)
    {
        if (feed.items.hasOwnProperty(itemKey))
        {
            var item = feed.items[itemKey];
            item.unread = false;
            feed.items[itemKey] = item;
        }
    }

    Storage.saveFeedData(feed);
}

function buildOptionsPrompt()
{
    var prompt = '<div id="optionsPrompt">'
               +   'Add new feeds from the <a href="javascript:;" data-role="optionsLink">Extension Options</a>'
               + '</div>';

    $('body').html(prompt);
}

$(document).ready(function() {
    chrome.browserAction.setBadgeText({text: ''});
    addRssRows();
    addClickHandlers();
});
