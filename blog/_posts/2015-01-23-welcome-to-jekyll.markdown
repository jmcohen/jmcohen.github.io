---
layout: post
title:  "Mapping the Human Taste Palate with Matrix Factorization"
date:   2015-01-23 02:34:15
categories: jekyll update
---

My classmates and I applied the matrix factorization technique for recommender systems to a data set of recipes and user profiles scraped from [AllRecipes](http://www.allrecipes.com) and extracted 40 "latent tastes" which together form a basis for all human foods.  The results are sort of cool.

Two types of people might find this post interesting:

*  Those who want to learn about matrix factorization, a fascinating technique for dimensionality reduction.

*  Those who already know about matrix factorization, and want to see what happens when we apply it to 42K recipes and 120K user profies from the most popular recipe-sharing web site on the internet.  These people might want to [skip to the results](results).

A Gentle Introduction to Matrix Factorization
-----------------------------

I'm sorry!  I'm sorry!

I know that the term "matrix factorization" is liable to trigger a life-threatening episode in people with linear algebra PTSD.
I swear I'm not trying to harm you.
I'm not like those psychopaths who make joke web sites with innocuous URLs like "StockMarketSecrets.com" that, when loaded, do not explain how to become Warren Buffet just by day trading at home in your underwear, but rather flash bright colors in rapid succession because inducing epileptic seizures is *hilarious.*

The truth is that *I* didn't pay any attention in linear algebra class either.
As far as I can tell, **"orthogonal"** is just a fancy synonym for "unrelated" that I should use when I want to sound smart, an **"eigenvector"** is probably something horrible that Werner von Braun dreamed up *before* he switched employers in 1945,  and a **"product space"** sounds like something that an undergrad business major living in SoMa would get excited about.

The good news is that you and I can understand matrix factorization without knowing a shred more about linear algebra than Keanu Reeves does.

Before I get into the details, I want to motivate the technique of matrix factorization by pointing out an application to the most heavily studied problem in computer science: **how to get people to buy more things**.

#### Techniques for Recommender Systems

Suppose that I order the [City Chic First Years Jet Stroller](http://www.amazon.com/First-Years-Stroller-City-Chic/dp/B002WB2G9I/ref=sr_1_1?) on Amazon.com.
Amazon would probably like to sell me more items, so that it can make more money, with which it can continue to not pay its software engineers.
So what items should Amazon recommend?

<!-- ![Alt text](http://ecx.images-amazon.com/images/I/71p8ZE%2BHIRL._SL1500_.jpg) -->

One idea is to recommend me items that are intrinsically similar to the [City Chic First Years Jet Stroller](http://www.amazon.com/First-Years-Stroller-City-Chic/dp/B002WB2G9I/ref=sr_1_1?).
These might be items that also have "stroller" in the name, or items that are made by the same manufacturer, or items whose descriptions share words in common with the description of the [City Chic First Years Jet Stroller](http://www.amazon.com/First-Years-Stroller-City-Chic/dp/B002WB2G9I/ref=sr_1_1?).
This is called **content-based recommendation**.

A more interesting idea is to treat the items as black boxes and somehow *learn* correlations between the items from the user purchasing data itself.
This is called **collaborative filtering**.
For example, I would bet that people who buy baby strollers are also likely to buy, say, the [Essential Mozart](http://www.amazon.com/Essential-Mozart/dp/B00005A8JZ) CD collection.
Now, maybe someday we'll have #deeplearning algorithms that can learn facts about the universe (e.g. [that American parents are crazy](http://en.wikipedia.org/wiki/Mozart_effect)) on their own, just from watching [Vines of cats](http://www.wired.com/2012/06/google-x-neural-network/) or whatever.
But until that day, we'll have to settle for matrix factorization.

#### Matrix Factorization: The Intuition

As an insufferable ninth grader, I took a bunch of online quizzes during the 2008 U.S. presidential election cycle.  These quizzes would ask a zillion questions about my personal political opinions, and then they would show me a Cartesian plane with two dimensions---social views and economic views---with a big dot somewhere that was supposed to represent me.
There were also dots for Barack Obama and John McCain, as well as for other notable figures like Karl Marx, Ayn Rand, Margaret Thatcher, and Abraham Lincoln, who had all apparently taken the quiz.
Everyone could be reduced to two numbers: their score on the "social views" scale, and their score on the "economic views" scale. 

This is basically how the matrix factorization technique for recommender systems works.

Matrix factorization and dubious ideology diagrams are both forms of **dimensionality reduction**.
Political platforms probably have hundreds of dimensions, like taxation, immigration, energy, national security, and climate change.
But the ideology quiz reduces every politician to just two: "social" and "economic."
This is neat because estimating my affinity for a candidate no longer requires knowing his or her opinion on the Keystone XL pipeline
Then, to estimate my affinity for a candidate, I don't need to know his or her opinion on the Keystone XL pipeline or on the ; I just need to know their coordinates on social and economic axes. 

In a similar way, matrix factorization reduces the dimensionality of the space of item properties down to a small number of factors.
Every item is represented by a vector of weights quantifying the extent to which each factor is present in the item, and every user is represented by a vector of weights quantifying the user's preference for each factor.

Imagine a big `U x I` matrix where each row corresponds to a user, and each column corresponds to an item.
The entry in the `(u, i)` square is the rating that user `u` gives to  item `i`.
If user `u` didn't rate item `i`, then the `(u, i)` square is empty.
Indeed, most squares are empty.
The goal of a recommender system is to fill in the empty squares given the observed ones.

Matrix factorization assumes that all items can be represented by `K` hidden factors, and that the `U x I` user-item matrix is really the product of a `U x K` user-factor matrix and a `K x I` factor-item matrix.

The `(u, k)` entry in the user-factor matrix quantifies user `u`'s affinity for factor `k`.
The `(k, i)` entry in the factor-item matrix quantifies the extent to which factor `k` is present in item `i`.




use the word orthogonal

Matrix Factorization and AllRecipes
------------

I took a machine learning course with an open-ended final project.
The question my group asked ourselves is: 

**Can we use matrix factorization to discover a set of basic human tastes in food?** 

We decided to get our data from [AllRecipes.com](http://www.allrecipes.com), a popular recipe sharing web site.
With tens of thousands of recipes and over a hundred thousand users, AllRecipes was a food data bonanza.

Each AllRecipes user has a "recipe box" where he or she can list his or her favorite recipes. 
It was these "recipe boxes" that we scraped.
After discarding all recipes that occurred in fewer than 300 recipe boxes, we were left with 9,546 recipes and 115,308 users.

We used the [NMF MATLAB toolbox](https://sites.google.com/site/nmftool/) to run non-negative matrix factorization on the resulting 9,546 × 115,308 matrix.
The algorithm took 8 hours to complete 2,000 iterations on a machine with a 2.2GHz processor and 128 GB RAM.

[Image here.]

The next morning, we checked the results and arrived at our answer to the question above:

**Yes, sort of!**

Sure enough, to our amusement and mild surprise, the factors produced by non-negative matrix factorization really do seem to correspond to human tastes!
The 40 factors are displayed below.
For each factor, the five recipes with the highest coeffecients in the factor are shown.

<style type="text/css">
	#factors-table {
		font-family: Gill Sans;
		clear: left;
		border-left: 5px black solid;
		margin-left: -20px;
		padding-left: 20px;
		overflow: auto;
	}

	#factors-table div {
		width: 170px;
		height: 200px;
		padding-right: 10px;
		float: left;
	}

	#factors-table ol {
		padding: 0px;
		margin: 0px;
		margin-left: 20px;
		font-size: 12px;
	}

	#factors-table .title {
		font-weight: bold;
		font-size: 14px;
	}

	{% include recipe-viz.css %}
</style>

<!-- <div id="factors-table">
{% include factors.html %}
</div>
<div style="clear: both"></div> -->

<!-- <link rel="stylesheet" src="/css/recipe-viz.css"> -->


comments

<span id="tastebreakdown-flag" />

### Taste Breakdown

Here is a visualization tool that shows the breakdown of each dish into the top three constituent factors: 

<div id="breakdown">
	<div>
		<div id="search-div">
			<input id="search" class="typeahead" type="text" placeholder="Chicken Marsala" size="40">
		</div>
	</div>
	<div id="stuff" style="float: left; position: relative; width: 800px; height: 400px;">
		<a class="permalink">permalink</a>
		<div id="canvas-holder" style="width: 370px; position: absolute; top: 0px; left: 228px;">
			<canvas id="canvas" width="372" height="150"/>
		</div>			
	</div>
</div>

<script src='/javascripts/Please.js' type="text/javascript"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
<script src="/javascripts/typeahead.js"></script>
<script src="/javascripts/recipeFactors.json"></script>
<script src="/javascripts/factorsTop.json"></script>
<script src='/javascripts/tastebreakdown.js' type="text/javascript"></script>
<script src='/javascripts/mixnmatch.js' type="text/javascript"></script>

<div style="clear: both;"></div>

### Mix 'n Match

<div id="mixnmatch" style="width: 820px; height: 658px; position: relative">
	<div id="selected_tastes" style="width: 228px;">
		<h4 id="help">Click on some tastes to begin!</h4>
	</div>
	<div id="tastes_left_col" style="position: absolute; left: 260px; top: 0px;"></div>
	<div id="tastes_right_col" style="position: absolute; left: 360px; top: 0px;"></div>
	<a class="permalink">permalink</a>
	<div id="recommendations" style="position: absolute; left: 480px; top: 0px; width: 340px;">
		<h4>Dishes closely matching the selected taste profile:</h4>
		<ol id="recommend-list">
		</ol>
	</div>
</div>


For a project in a machine learning course, my group decided to see if we could use matrix factorization on a domain near and dear to all of us 


This post describes a project carried out for [David Blei's](http://www.cs.columbia.edu/~blei/) course "COS 424: Interacting with Data" in Spring 2014 at Princeton University by Rob Sami (Google), Aaron Schild (Berkeley PhD), Spencer Tank (Palantir), and me.

**Thanks** to [Richard Nixon](http://www.nixonlibrary.gov/) for reviewing and revising the draft.
