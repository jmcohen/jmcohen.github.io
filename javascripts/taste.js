var numTastes = 40;
var colors = Please.make_color({colors_returned: numTastes});

var TASTE_BREAKDOWN = (function (recipeFactors, factorsTop) {
	var recipe;
	var module = {};

	var setRecipe = function(name) {
		recipe = name;

		var panelXs, panelYs;
		var areaWidth = 372;

		var barHeight = 100;
		var barWidth = 300;


		var recipeTastes = recipeFactors[recipe];
		var proportions = normalizeTasteProfile(recipeTastes);

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

		$("#visualization .taste-card").remove();
		$("#search").val(name);

		var canvas = document.getElementById("canvas");
		var context = canvas.getContext("2d");

		context.clearRect(0 , 0, canvas.width, canvas.height);

		var left = (areaWidth - barWidth) / 2;

		for (var i = 0; i < proportions.length; i++) {
			var tastePercent = recipeTastes[i][1];
			var tasteId = recipeTastes[i][0];
			var segmentWidth = proportions[i] * barWidth;
			context.fillStyle = colors[tasteId];
			context.fillRect(left, 0, segmentWidth, barHeight);

			var panel = SHARED.makeTasteCard(tasteId, tastePercent, setRecipe);
			panel.css("left", panelXs[i])
			panel.css("top", panelYs[i]);
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

		updatePermalink();
	};
	module.setRecipe = setRecipe;

	var updatePermalink = function() {
		$("#breakdown .permalink").attr('href', "#breakdown_" + recipe);
		$("#breakdown .permalink").show();
	};

	var processPermalink = function() {
		if (window.location.hash.indexOf("#breakdown") == 0) {
			var name = window.location.hash.split("_")[1];
			setRecipe(name);
			scrollTo("taste-breakdown");
		}
	};

	var initializeTypeahead = function() {
		var names = shuffle(Object.keys(recipeFactors));
		$('#search').typeahead({
			hint: true,
	 		highlight: true,
			minLength: 1
		}, {
			name: 'recipes',
			displayKey: 'value',
			source: substringMatcher(names)
		});

		$('#search').bind("enterKey",function(e){
			var name = $('#search').val();
			setRecipe(name);
		});

		$('#search').keyup(function(e){
		    if(e.keyCode == 13) {
		        $(this).trigger("enterKey");
		    }
		});
	};

	$(document).ready(function() {
		initializeTypeahead();
		setRecipe('Naan');
		processPermalink();
	});

	// copied from the twitter typeahead documentation
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

	function normalizeTasteProfile(tastes) {
		var normalized = [];
		var sum = 0.0;
		for (var i = 0; i < tastes.length; i++) {
			sum += tastes[i][1];
		}
		for (var i = 0; i < tastes.length; i++) {
			normalized.push(tastes[i][1] / sum);
		}	
		return normalized;
	};

	return module;
})(window.recipeFactors, window.factorsTop);


var MIX_N_MATCH = (function (recipeFactors, factorsTop) {
	var selectedTastes = [];

	var isSelected = function(tasteId) {
		return selectedTastes.indexOf(tasteId) != -1;
	}

	var showRecipe = function(name) {
		TASTE_BREAKDOWN.setRecipe(name);
		scrollTo("taste-breakdown");
	};

	var refreshTasteCards = function() {
		$("#selected-tastes #help").hide();
		$("#selected-tastes .taste-card").remove();
		var percent = 1 / selectedTastes.length;
		$.each(selectedTastes, function(i, tasteId) {
			var tasteCard = SHARED.makeTasteCard(tasteId, percent, showRecipe);
			$("#selected-tastes").append(tasteCard);
		});
	}

	var refreshOptions = function() {
		$.each(selectedTastes, function(i, tasteId) {
			console.log(tasteId);
			$("#tastes-list .option[data-taste=" + tasteId + "]").css("color", "white");
			$("#tastes-list .option[data-taste=" + tasteId + "]").css("background-color", colors[tasteId]);	
		});
	}

	var refresh = function() {
		refreshTasteCards();
		refreshPermalink();
		refreshRecommendations();
		refreshOptions();

		if (selectedTastes.length == 0) {
			$("#mixnmatch #help").show();
		}
	}

	var previewTasteCard = function(tasteId) {
		var tasteCard = SHARED.makeTasteCard(tasteId, "", null);
		tasteCard.addClass("preview");
		$("#selected-tastes").append(tasteCard);
	}

	var makeOption = function(tasteId) {
		var option = $("<li>");
		option.addClass("option");
		option.append($("<span>").addClass("name").text(SHARED.tasteName(tasteId)));
		option.attr("data-taste", tasteId);
		option.css("border-color", colors[tasteId]);
		option.addClass("unselected");
		return option;
	};

	var initializeOptions = function () {
		var leftColumn = $("#mixnmatch #tastes-left-col");
		var rightColumn = $("#mixnmatch #tastes-right-col");
		for (var i = 0; i < numTastes / 2; i++) {
			var leftOption = makeOption(i);
			var rightOption = makeOption(i + numTastes / 2);

			leftColumn.append(leftOption);
			rightColumn.append(rightOption);

			var onmouseover = function () {
				var tasteId = $(this).attr('data-taste');
				$(this).css("color", "white");
				$(this).css("background-color", colors[tasteId]);
				if (!isSelected(tasteId)) {
					previewTasteCard(tasteId);
				}
			};

			var onmouseout = function () {
				var tasteId = $(this).attr('data-taste');
				if (!isSelected(tasteId)){
					$(this).css("color", "black");
					$(this).css("background-color", "white");
				}
				$("#selected-tastes .preview").remove();
			};

			var onclick = function () {
				var tasteId = $(this).attr('data-taste');
				var indexOf = selectedTastes.indexOf(tasteId);
				if (indexOf == -1) {
					selectedTastes.push(tasteId);
				} else {
					selectedTastes.splice(indexOf, 1);
					$(this).css("color", "black");
					$(this).css("background-color", "white");
				}

				refresh();
			};

			leftOption.hover(onmouseover, onmouseout);
			leftOption.click(onclick);
			rightOption.hover(onmouseover, onmouseout);
			rightOption.click(onclick);

		}
	};

	var refreshRecommendations = function() {
		var N = 20; // number of recommendations to show

		$("#recommend-list").empty();

		if (selectedTastes.length > 0) {
			var recommendations = recommend(selectedTastes, N);
			$.each(recommendations, function(i, name) {
				var link = $("<a>").text(name).click(function() {showRecipe(name)});
				$("#recommend-list").append($("<li>").append(link));
			});		
		}
	};

	function processPermalink() {
		if (window.location.hash.indexOf("#mixnmatch_") == 0) {
			selectedTastes = window.location.hash.split("_")[1].split(',');
			refresh();
			scrollTo("mix-n-match");
		}
	};

	function refreshPermalink() {
		var permalink = "#mixnmatch_" + selectedTastes.join(',');
		$("#mixnmatch .permalink").attr('href', permalink);

		if (selectedTastes.length > 0) {
			$("#mixnmatch .permalink").show();
		} else {
			$("#mixnmatch .permalink").hide();
		}
	};

	$(document).ready(function(){
		initializeOptions()
		processPermalink();
	});

	// return the n most similar recipes
	function recommend(selectedTasteIds, n) {

		// assume all tastes are present in equal proportions
		var percent = 1.0 / selectedTasteIds.length;
		var tasteProfile = [];
		$.each(selectedTasteIds, function(i, tasteId) {
			tasteProfile.push([tasteId, percent]);
		});

		var similarity = function(a,b) {
			var aMag = 0;
			var bMag = 0;
			var abDot = 0;


			$.each(a, function(i, aTaste) {
				aMag += aTaste[1] * aTaste[1];
			});

			aMag = Math.sqrt(aMag);

			$.each(b, function(i, bTaste) {
				bMag += bTaste[1] * bTaste[1];
			});
			bMag = Math.sqrt(bMag);

			$.each(a, function(i, aTaste) {
				$.each(b, function(i, bTaste) {
					if (aTaste[0] == bTaste[0]) {
						abDot += aTaste[1] * bTaste[1];
					}
		
					});
			});
			return abDot / (aMag * bMag);
		}

		var names = Object.keys(window.recipeFactors);
		var similarities = {};
		for (var name in window.recipeFactors) {
			similarities[name] = similarity(tasteProfile, window.recipeFactors[name]);
		}

		names.sort(function(a, b) {
			return similarities[b] - similarities[a];
		});

		return names.slice(0, n);
	};

})(window.recipeFactors, window.factorsTop);

var SHARED = (function (recipeFactors, factorsTop) {
	var module = {};

	var tasteName = function(tasteId) {
		return "Taste " + (parseInt(tasteId) + 1);
	};
	module.tasteName = tasteName;

	module.makeTasteCard = function(tasteId, percent, onclick) {
		var list = $("<ol>").addClass("recipe-list");
		$.each(factorsTop[tasteId], function(i, name) {
			if (onclick){
				var link = $("<a>").text(name).click(
					function(){
						onclick(name);
					}
				);
				list.append($("<li>").append(link));
			} else {
				list.append($("<li>").text(name));
			}
		});
		var color = colors[tasteId];
		var title = $("<span>").addClass("title").css("color", color)
								.text(tasteName(tasteId));
		var subtitle = $("<span>").addClass("subtitle").css('color', color);
		if (percent) {
			var percentString = Math.round(percent * 100);
			subtitle.text(percentString + "%");
		}
		return 	 $("<div>") .addClass("taste-card")
							.append(title)
							.append(subtitle)
							.append(list)
							.css('border-color', colors[tasteId]);
	};

	return module;
})(window.recipeFactors, window.factorsTop);

var TASTE_GRID = (function (recipeFactors, factorsTop) {

	$(document).ready(function(){
		// make the grid

		var numCols = 3;
		for (var i = 0; i < numCols; i++) {
			$("#taste-grid").append($("<div>")
									.addClass("column")
									.addClass("col" + i));
		}

		for (var i = 0; i < numTastes; i++) {
			var card = SHARED.makeTasteCard(i, "", null);
			$("#taste-grid .col" + (i % numCols)).append(card);
		}

		// for showing/hiding the grid

		$("#toggle-taste-grid").click(function() {
			$("#taste-grid").toggle();
			if ($("#taste-grid").is(":visible")) {
				$("#toggle-verb").text("Hide");
			} else {
				$("#toggle-verb").text("Show");	
			}
		});
	});
})(window.recipeFactors, window.factorsTop);


// Utility functions

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};


var scrollTo = function(id) {
	$('html,body').animate({scrollTop: $("#"+id).offset().top},'slow');
}

