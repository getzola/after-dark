// Take from Zola repository:
// https://github.com/getzola/zola/blob/master/docs/static/search.js
function debounce(func, wait) {
  var timeout;

  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);

    timeout = setTimeout(function () {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

// Taken from mdbook
// The strategy is as follows:
// First, assign a value to each word in the document:
//  Words that correspond to search terms (stemmer aware): 40
//  Normal words: 2
//  First word in a sentence: 8
// Then use a sliding window with a constant number of words and count the
// sum of the values of the words within the window. Then use the window that got the
// maximum sum. If there are multiple maximas, then get the last one.
// Enclose the terms in <b>.
function makeTeaser(body, terms) {
  var TERM_WEIGHT = 40;
  var NORMAL_WORD_WEIGHT = 2;
  var FIRST_WORD_WEIGHT = 8;
  var TEASER_MAX_WORDS = 30;

  var stemmedTerms = terms.map(function (w) {
    return elasticlunr.stemmer(w.toLowerCase());
  });
  var termFound = false;
  var index = 0;
  var weighted = []; // contains elements of ["word", weight, index_in_document]

  // split in sentences, then words
  var sentences = body.toLowerCase().split(". ");

  for (var i in sentences) {
    var words = sentences[i].split(" ");
    var value = FIRST_WORD_WEIGHT;

    for (var j in words) {
      var word = words[j];

      if (word.length > 0) {
        for (var k in stemmedTerms) {
          if (elasticlunr.stemmer(word).startsWith(stemmedTerms[k])) {
            value = TERM_WEIGHT;
            termFound = true;
          }
        }
        weighted.push([word, value, index]);
        value = NORMAL_WORD_WEIGHT;
      }

      index += word.length;
      index += 1; // ' ' or '.' if last word in sentence
    }

    index += 1; // because we split at a two-char boundary '. '
  }

  if (weighted.length === 0) {
    return body;
  }

  var windowWeights = [];
  var windowSize = Math.min(weighted.length, TEASER_MAX_WORDS);
  // We add a window with all the weights first
  var curSum = 0;
  for (var i = 0; i < windowSize; i++) {
    curSum += weighted[i][1];
  }
  windowWeights.push(curSum);

  for (var i = 0; i < weighted.length - windowSize; i++) {
    curSum -= weighted[i][1];
    curSum += weighted[i + windowSize][1];
    windowWeights.push(curSum);
  }

  // If we didn't find the term, just pick the first window
  var maxSumIndex = 0;
  if (termFound) {
    var maxFound = 0;
    // backwards
    for (var i = windowWeights.length - 1; i >= 0; i--) {
      if (windowWeights[i] > maxFound) {
        maxFound = windowWeights[i];
        maxSumIndex = i;
      }
    }
  }

  var teaser = [];
  var startIndex = weighted[maxSumIndex][2];
  for (var i = maxSumIndex; i < maxSumIndex + windowSize; i++) {
    var word = weighted[i];
    if (startIndex < word[2]) {
      // missing text from index to start of `word`
      teaser.push(body.substring(startIndex, word[2]));
      startIndex = word[2];
    }

    // add <em/> around search terms
    if (word[1] === TERM_WEIGHT) {
      teaser.push("<b>");
    }
    startIndex = word[2] + word[0].length;
    teaser.push(body.substring(word[2], startIndex));

    if (word[1] === TERM_WEIGHT) {
      teaser.push("</b>");
    }
  }
  teaser.push("…");
  return teaser.join("");
}

function formatSearchResultItem(item, terms) {
  return (
    '<div class="search-results__item">' +
    `<a href="${item.ref}">${item.doc.title}</a>` +
    `<div>${makeTeaser(item.doc.body, terms)}</div>` +
    "</div>"
  );
}

function initSearch() {
  var $searchInput = document.getElementById("search");
  var $searchResults = document.querySelector(".search-results");
  var $searchResultsItems = document.querySelector(".search-results__items");
  var MAX_ITEMS = 10;

  var options = {
    bool: "AND",
    fields: {
      title: { boost: 2 },
      body: { boost: 1 },
    },
  };
  var currentTerm = "";
  var index;

  const initIndex = async function () {
    if (index === undefined) {
      try {
        // Try relative to the current path first
        const indexPath = `${window.location.pathname.replace(/\/+$/, "")}/search_index.en.json`;
        const response = await fetch(indexPath);

        if (!response.ok) {
          // If that fails, try from the root
          const rootResponse = await fetch("/search_index.en.json");
          if (!rootResponse.ok) {
            throw new Error("Search index not found");
          }
          const data = await rootResponse.json();
          index = Promise.resolve(elasticlunr.Index.load(data));
        } else {
          const data = await response.json();
          index = Promise.resolve(elasticlunr.Index.load(data));
        }
      } catch (error) {
        console.error("Error loading search index:", error);
        throw error;
      }
    }

    return await index;
  };

  $searchInput.addEventListener(
    "keyup",
    debounce(async function () {
      var term = $searchInput.value.trim();
      if (term === currentTerm) {
        return;
      }
      $searchResults.style.display = term === "" ? "none" : "block";
      $searchResultsItems.innerHTML = "";
      currentTerm = term;
      if (term === "") {
        return;
      }

      var results = (await initIndex()).search(term, options);
      if (results.length === 0) {
        $searchResults.style.display = "none";
        return;
      }

      for (var i = 0; i < Math.min(results.length, MAX_ITEMS); i++) {
        var item = document.createElement("li");
        item.innerHTML = formatSearchResultItem(results[i], term.split(" "));
        $searchResultsItems.appendChild(item);
      }
    }, 150),
  );

  // exit search on ESC key and move cursor out of search results
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      $searchResults.style.display = "none";
      // clear search query to go back to placeholder
      $searchInput.value = "";
      $searchInput.blur();
    }
  });

  // on enter event immediately display results
  $searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      $searchResults.style.display = "block";
    }
  });

  window.addEventListener("click", function (e) {
    if (
      $searchResults.style.display == "block" &&
      !$searchResults.contains(e.target)
    ) {
      $searchResults.style.display = "none";
    }
  });
}

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  initSearch();
} else {
  document.addEventListener("DOMContentLoaded", initSearch);
}
