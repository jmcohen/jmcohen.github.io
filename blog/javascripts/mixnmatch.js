var numFactors = 40;

function getCurrentUrl() {
	return window.location.protocol + "//" + window.location.host + "/" + window.location.pathname;
}

function getPermalink() {
	var selected = getSelectedTastes();
	return /*getCurrentUrl() +*/ "#mixnmatch_" + selected.join(',');
}

function processPermalink() {
	if (window.location.hash.indexOf("#mixnmatch_") == 0) {
		var selected = window.location.hash.split("_")[1].split(',');
		$.each(selected, function(i, tasteId) {
			selectTaste($(".option[data-taste='" + tasteId +"']"), tasteId);
			addTaste(tasteId);
			updateSimilar();
		});
		scrollTo("mix-n-match");
		updatePermalink();
		if (selected.length > 0) {
			$("#mixnmatch #help").hide();
		}
	}
}

function updatePermalink() {
	$("#mixnmatch .permalink").attr('href', getPermalink());
	$("#mixnmatch .permalink").show();
}

var scrollTo = function(id) {
	$('html,body').animate({scrollTop: $("#"+id).offset().top},'slow');
}

var makeLink = function(name) {
	return $("<a>").text(name).click(function(){
		showRecipe(name);
		scrollTo("taste-breakdown");
	});
}

var addTaste = function(tasteId) {
	var tasteFrame = $("<div>").addClass("taste-card");
	tasteFrame.attr('taste-data', tasteId);
	var list = $("<ol>").addClass("recipe-list");
	$.each(window.factorsTop[tasteId], function(i, name) {
		list.append($("<li>").append(makeLink(name)));
	});
	var color = window.colors[tasteId];
	var title = $("<span>").addClass("title").css("color", color).text("Taste " + tasteId);
	var subtitle = $("<span>").addClass("subtitle").css("color", color);
	tasteFrame.css('border-color', color);
	tasteFrame.append(title).append(subtitle).append(list);
	$("#selected-tastes").append(tasteFrame);
}

var removeTaste = function(tasteId) {
	$(".taste-card[taste-data=" + tasteId + "]").remove();
}

// var selectedTastes = [];

function getSelectedTastes() {
	return $(".option.selected").map(function(){return $(this).attr("data-taste");}).get();
}

function updateSimilar() {
	$("#recommend-list").empty();

	var N = 20;
	var selectedTastes = getSelectedTastes();

	if (selectedTastes.length > 0) {
		var similar = getSimilarRecipes(makeTasteProfile(selectedTastes), N);
		$.each(similar, function(i, dish) {
			$("#recommend-list").append($("<li>").append(makeLink(dish)));
		});		
	}
}

function selectTaste(tasteLink, tasteId) {
	tasteLink.addClass("selected");
	var color = window.colors[tasteId];
	tasteLink.css("color", color);
}

function deselectTaste(tasteLink, tasteId) {
	tasteLink.removeClass("selected");
	tasteLink.removeClass("hover");
	tasteLink.css("color", "black");
	removeTaste(tasteId);
}

$(document).ready(function(){
	function makeTasteLink(tasteId) {
		var link = $("<li>");
		link.addClass("option");
		link.append($("<span>").addClass("name").text("Taste " + tasteId));
		link.attr("data-taste", tasteId);
		link.css("border-color", window.colors[tasteId]);
		link.addClass("unselected");
		return link;
	}

	var area = $("#mixnmatch");
	var leftColumn = area.find("#tastes-left-col");
	var rightColumn = area.find("#tastes-right-col");

	for (var i = 0; i < numFactors / 2; i++) {
		var leftTasteLink = makeTasteLink(i);
		var rightTasteLink = makeTasteLink(i + numFactors / 2);

		leftColumn.append(leftTasteLink);
		rightColumn.append(rightTasteLink);

		function onmouseover() {
			var tasteId = $(this).data("taste");
			var color = window.colors[tasteId];
			$(this).css("color", color);
			$(this).addClass("hover");
			if ($(this).hasClass("selected") == false) {
				addTaste(tasteId);
			}
			$("#mixnmatch #help").hide();
		}

		function onmouseout() { 
			if ($(this).hasClass("selected") == false) {
				$(this).css("color", "black");
				var tasteId = $(this).data("taste");
				removeTaste(tasteId);
			}
			$(this).removeClass("hover");

			if (getSelectedTastes().length == 0) {
				$("#mixnmatch #help").show();
			}
		}

		function onclick() {
			var tasteId = $(this).attr('data-taste');
			// var indexOf = selectedTastes.indexOf(tasteId);
			// if (indexOf == -1) {
			if ($(this).hasClass("selected")) {
				deselectTaste($(this), tasteId);
			} else {
				selectTaste($(this), tasteId);
			}
			var numSelected = getSelectedTastes().length;
			var percent = 1.0 / numSelected;
			var percentString = Math.round(percent * 100);
			$("#mixnmatch .subtitle").text(percentString + "%");

			if (numSelected == 0) {
				$("#mixnmatch #help").show();
			}

			updatePermalink();

			updateSimilar();
		}

		leftTasteLink.hover(onmouseover, onmouseout);
		leftTasteLink.click(onclick);
		rightTasteLink.hover(onmouseover, onmouseout);
		rightTasteLink.click(onclick);
	}

	processPermalink();
});

function makeTasteProfile(selected) {
	var degree = 1.0 / selected.length;
	var tasteProfile = [];
	$.each(selected, function(i, tasteId) {
		tasteProfile.push([tasteId, degree]);
	});
	return tasteProfile;
}

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

	return names.slice(0, n);
}

