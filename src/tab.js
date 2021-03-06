var running = true;
var lastLocation = null;

if (!sessionStorage.getItem('buttonsClicked')) {
    sessionStorage.setItem('buttonsClicked', JSON.stringify([]));
}

var buttonsClicked = JSON.parse(sessionStorage.getItem('buttonsClicked'));

var extractProfileId = function (string) {
    var expression = /key=(\d*)/g;
    var matches = expression.exec(string);
    return matches[1];
};

var addPeopleFromSearchPage = function () {
    if (!running) {
        return;
    }

    var delayBetweenClicks = 500;

    var alreadyInvited = 0;

    var buttonsFromNewInterface = document.querySelectorAll('button.search-result__actions--primary.m5:enabled:not(.message-anywhere-button)');

    var clickSendNowButtonIfAvailable = function () {
        var buttonSendNow = document.querySelector('div.send-invite__actions > button.button-primary-large.ml1:enabled');
        var buttonCancel = document.querySelector('div.send-invite__actions > send-invite__cancel-btn');
        if (buttonSendNow) {
            //todo add a note here
            buttonSendNow.click();
        }
        else if(buttonCancel)
        {
            buttonCancel.click();
        }
    };

    var isRecruiter = function (item){

        var resultHtml = item.parentElement.parentElement.parentElement.innerHTML
        if(strContains(resultHtml,'recruit'))// this needs some work
        {
            console.error("recruiter")
            return false;
        }
        return true;
    }

    if (buttonsFromNewInterface.length > 0) {
        delayBetweenClicks = 1500;
        buttonsFromNewInterface.forEach(function (item) {
            setTimeout(function () {
                if (running) {
                    
                    try {
                        console.log("Processing")
                        if(isRecruiter(item))
                        {
                            console.log("Not a recruiter, let's crack on")
                            console.log("Closing any dialog shizzle")
                            clickSendNowButtonIfAvailable();
                            
                            console.log("Getting the focus and clicking connect")
                            item.focus();
                            item.click();
                            console.log("Updating status")
                            item.setAttribute("disabled", "true");
                            item['innerText'] = "Invite Sent";
                            console.log("Clicking send on any dialog")
                            clickSendNowButtonIfAvailable();
                            console.log(item);
                        }
                        else{
                            item.setAttribute("disabled", "true");
                            item['innerText'] = "recruiter";
                        }
                        
                    } catch (error) {
                        console.error("Something fucked up! error:" + error)
                    }
                 
                }
            }, alreadyInvited++ * delayBetweenClicks);
        });
    }

    setTimeout(function () {
        if (!running) {
            return;
        }

        var connectButtonsLeft = false;

        document.querySelectorAll('.primary-action-button').forEach(function (item) {
            if (!arrayContains(extractProfileId(item.getAttribute("href")), buttonsClicked)) {
                connectButtonsLeft = true;
            }
        });

        if (document.querySelectorAll('button.search-result__actions--primary.m5:enabled:not(.message-anywhere-button)').length > 0) {
            connectButtonsLeft = true;
        }

        if (connectButtonsLeft) {
            addPeopleFromSearchPage();
        } else {
            var nextButtonFromNewInterface = document.querySelector('button.next');
             if (nextButtonFromNewInterface) {
                nextButtonFromNewInterface.click();
            }
        }
    }, alreadyInvited * delayBetweenClicks + 1000);
};

var addPeopleFromPymkPage = function () {
    if (!running) {
        return;
    }

    var delayBetweenClicks = 2000;

    var alreadyInvited = 0;

    var buttonsFromNewInterface = document.querySelectorAll('button.button-secondary-small[data-control-name="invite"]');

    var functionToBeCalledOnButtons = function (item) {
        setTimeout(function () {
            if (running) {
                item.focus();
                item.click();
                window.scrollBy(0, 100);
            }
        }, alreadyInvited++ * delayBetweenClicks);
    };

    if (buttonsFromNewInterface.length > 0) {
        buttonsFromNewInterface.forEach(functionToBeCalledOnButtons);
    }

    setTimeout(function () {
        addPeopleFromPymkPage();
    }, alreadyInvited * delayBetweenClicks + 1000);
};

var strContains = function (string, substring) {
    return (string.indexOf(substring) !== -1);
};

var isOnSearchPage = function () {
    return (strContains(location.href, "linkedin.com/search/results/people"));
};

var isOnPymkPage = function () {
    return (strContains(location.href, "linkedin.com/mynetwork"));
};

var arrayContains = function (needle, haystack) {
    return (haystack.indexOf(needle) > -1);
};

var checkIfUrlHasChanged = function () {
    if (!running || location.href === lastLocation) {
        return;
    }

    lastLocation = location.href;

    if (isOnSearchPage()) {
        addPeopleFromSearchPage();
    } else if (isOnPymkPage()) {
        addPeopleFromPymkPage();
    } else {
        running = false;
    }
};

if (typeof loop === 'undefined') {
    var loop = setInterval(checkIfUrlHasChanged, 1000);
}