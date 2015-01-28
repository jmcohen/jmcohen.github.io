var numFactors = 40;

var colors = Please.make_color({colors_returned: 40});
window.colors = colors; // todo make this less hacky

var areaWidth = 372;

var barHeight = 100;
var barWidth = 300;

function getPermalink2() {
	var name = $("#search").val();
	return "#breakdown_" + name;
}

function processPermalink2() {
	if (window.location.hash.indexOf("#breakdown") == 0) {
		var name = window.location.hash.split("_")[1];
		showRecipe(name);
		scrollTo("taste-breakdown");
	}
}

function updatePermalink2() {
	$("#breakdown .permalink").attr('href', getPermalink2());
	$("#breakdown .permalink").show();
}

function normalizeFactors(factors) {
	var normalized = [];
	var sum = 0.0;
	for (var i = 0; i < factors.length; i++) {
		sum += factors[i][1];
	}
	for (var i = 0; i < factors.length; i++) {
		normalized.push(factors[i][1] / sum);
	}	
	return normalized;
}

function makeBar(name) {
	var width = 60;
	var height = 20;

	var factors = window.recipeFactors[name];
	var proportions = normalizeFactors(factors);

	var canvas = $('<canvas>').attr('width', width).attr('height', height).get(0);
	var context = canvas.getContext("2d");

	var left = 0;
	for (var i = 0; i < proportions.length; i++) {
		var tastePercent = factors[i][1];
		var tasteId = factors[i][0];
		var segmentWidth = proportions[i] * width;
		context.fillStyle = colors[tasteId];
		context.fillRect(left, 0, segmentWidth, height);

		left += segmentWidth;	
	}
	return canvas;
}


function showRecipe(name) {
	var panelXs, panelYs;

	var factors = window.recipeFactors[name];
	var proportions = normalizeFactors(factors);

	var N = proportions.length;

	if (N == 3) {
		panelXs = [0, 300, 600];
		panelYs = [30, 150, 30];
	} else if (N == 2) {
		panelXs = [0, 600];
		panelYs = [30, 30];		
	} else {
		panelXs = [300];
		panelYs = [150];		
	}

	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");

	context.clearRect(0 , 0, canvas.width, canvas.height);
	$("#visualization .taste-card").remove();
	$("#recipe-name").text(name);
	$("#search").val(name);

	var left = (areaWidth - barWidth) / 2;

	for (var i = 0; i < proportions.length; i++) {
		var tastePercent = factors[i][1];
		var tasteId = factors[i][0];
		var segmentWidth = proportions[i] * barWidth;
		context.fillStyle = colors[tasteId];
		context.fillRect(left, 0, segmentWidth, barHeight);

		var panel = getFactorFrame(tasteId, tastePercent);
		panel.css("left", panelXs[i])
		panel.css("top", panelYs[i]);
		panel.css("border-color", colors[tasteId]);
		panel.find(".colored").css("color", colors[tasteId]);
		$("#visualization").append(panel);

		var stub = 20;
		var lw = 4; // line width

		if (N == 1) {
			context.fillRect(left + barWidth / 2, barHeight, 4, 150 - barHeight);
		} else {
			context.fillRect(left + segmentWidth / 2, barHeight, lw, stub);
			if (i == 0) { // line to left box
				context.fillRect(0, barHeight + stub, left + segmentWidth / 2 + lw, lw);
			} else if (i == 1 && N == 3) {
				var x = left + segmentWidth / 2;
				context.fillRect(areaWidth / 2, barHeight + stub, x - (areaWidth / 2) + lw, lw);
				context.fillRect(areaWidth / 2, barHeight + stub, lw, panelYs[i] - (barHeight + stub));
			} else {
				context.fillRect(left + segmentWidth / 2, barHeight + stub, areaWidth - (left + segmentWidth / 2), lw);		
			}
		}

		left += segmentWidth;
	}

	$("#similar").empty();
	var recipe = window.recipeFactors[name];
	var similar = getSimilarRecipes(recipe, 5);
	$.each(similar, function(i, name) {
		$("#similar").append($("<li>").append(makeBar(name)).append(makeLink(name)));
	});

	updatePermalink2();
}

// TODO TODO RENAME TASTES SO THAT THEY START AT 1!!

var getFactorFrame = function(tasteId, percent) {
	var list = $("<ol>").addClass("recipe-list");
	$.each(window.factorsTop[tasteId], function(i, name) {
		list.append($("<li>").append(makeLink(name)));
	});
	var title = $("<span>").addClass("title").addClass("colored").text("Taste " + tasteId);
	var percentString = Math.round(percent * 100);
	var subtitle = $("<span>").addClass("subtitle").addClass("colored").text(percentString + "%");
	return $("<div>").addClass("taste-card").append(title).append(subtitle).append(list);
}

var makeLink = function(name) {
	return $("<a>").text(name).click(function(){
		showRecipe(name);
	});
}

$('#search').bind("enterKey",function(e){
	var name = $('#search').val();
	showRecipe(name);
});

$('#search').keyup(function(e){
    if(e.keyCode == 13) {
        $(this).trigger("enterKey");
    }
});


var substringMatcher = function(strs) {
	var max = 100;

  return function findMatches(q, cb) {
    var matches, substrRegex, count;
 
    // an array that will be populated with substring matches
    matches = [];

    count = 0;
 
    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');
 
    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
    	if (count == max) return;
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
        count += 1;
      }
    });
 
    cb(matches);

  };
};



$(document).ready(function(){
	var names = shuffle(Object.keys(window.recipeFactors));
	$('#search').typeahead({
		hint: true,
 		highlight: true,
		minLength: 1
		}, {
		name: 'recipes',
		displayKey: 'value',
		source: substringMatcher(names)
	});

	showRecipe('Naan');

	processPermalink2();
});

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};


// return the n most similar recipes
function getSimilarRecipes(recipe, n) {
	var similarity = function(a,b) {
		var aMag = 0;
		var bMag = 0;
		var abDot = 0;


		$.each(a, function(i, aFactor) {
			aMag += aFactor[1] * aFactor[1];
		});

		aMag = Math.sqrt(aMag);

		$.each(b, function(i, bFactor) {
			bMag += bFactor[1] * bFactor[1];
		});
		bMag = Math.sqrt(bMag);

		$.each(a, function(i, aFactor) {
			$.each(b, function(i, bFactor) {
				if (aFactor[0] == bFactor[0]) {
					abDot += aFactor[1] * bFactor[1];
				}
	
				});
		});
		return abDot / (aMag * bMag);
	}

	var names = Object.keys(window.recipeFactors);
	var similarities = {};
	for (var name in window.recipeFactors) {
		similarities[name] = similarity(recipe, window.recipeFactors[name]);
	}

	names.sort(function(a, b) {
		return similarities[b] - similarities[a];
	});

	return names.slice(1, n + 1); // the 0th element is the recipe itself, so don't return it
}

