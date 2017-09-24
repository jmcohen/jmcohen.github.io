---
layout: post
title:  "Efficiently Evaluating Logistic Regression with Feature Crosses"
date:   2017-09-23 10:00:00
categories: 
---

<script src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML'></script>
<script type="text/x-mathjax-config">
MathJax.Hub.Config({
  tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},
  TeX: { equationNumbers: { autoNumber: "AMS" } }
});
</script>

In this post I'll describe a neat trick for efficiently evaluating a 
trained logistic regression model under a specific problem setup that arises in online advertising. 

### The Problem

At work I'm currently helping to build an ad server, a piece of software that chooses which 
ad to serve in a given context.
A crucial sub-problem is to compute the probability that each ad in our inventory will get clicked on.

We know some information about the request context, which we can represent as a feature vector
$\mathbf{x}_r \in \mathbb{R}^{d_r}$, and we know some information about each ad $i$, which we can represent as a feature vector 
$\mathbf{x}^i_a \in \mathbb{R}^{d_a}$.

We've trained a model on historical data to predict the probability of a click
given the joint feature vector $\mathbf{x} = \begin{bmatrix}
\mathbf{x}_a & \mathbf{x}_r
\end{bmatrix} \in \mathbb{R}^d$.

 The form of the model is logistic regression with degree-2 interaction terms thrown in:
 $$ p(\text{click} | \mathbf{x}) = \text{logistic} \left( \sum_{j=1}^{d} w_j x_j + \sum_{j=1}^d \sum_{k=1}^d W_{jk} x_j x_k \right)$$

where $\mathbf{w} \in \mathbb{R}^d$ are the weights of the features and $\mathbf{W} \in \mathbb{R}^{d \times d}$ 
are the weights of the feature interactions.

Given a request context $\mathbf{x}_r$, we need to compute 
$p(\text{click} | \mathbf{x}_r, \mathbf{x}_a^i)$ for each ad $i$ in our inventory.

The naive way to score $n$ ads against the request context would take $O(n d^2)$ operations.
But it turns out that if we are allowed to pre-compute some information about each ad ahead of time, we can bring the cost of processing a request down to $O(d_r^2 + nd_r)$.

### The Trick

First, write the model in linear algebra notation: 

$$p(\text{click} | \mathbf{x}) = \text{logistic} \left(\mathbf{w}^T \mathbf{x} + \mathbf{x}^T \mathbf{W} \mathbf{x} \right)$$

Now, notice that we can divide the feature weights into request feature weights and ad feature 
weights, and we can divide the feature interaction weights into request-request interaction weights,
 ad-ad interaction weights, and request-ad interaction weights:

$$ \mathbf{w} = \begin{bmatrix} \mathbf{w}_r && \mathbf{w}_a \end{bmatrix} \quad \quad
 \mathbf{W} = \begin{bmatrix} \mathbf{W}_{rr} && \frac{1}{2} \mathbf{W}_{ra} \\ \frac{1}{2} \mathbf{W}_{ra} && \mathbf{W}_{aa} \end{bmatrix} $$

Therefore, the model can be written as 
$$p(\text{click} | \mathbf{x}) = \text{logistic} \left(\mathbf{w}_a^T \mathbf{x}_a + \mathbf{w}_r^T \mathbf{x}_r + \mathbf{x}_a^T \mathbf{W}_{aa} \mathbf{x}_a  + \mathbf{x}_r^T \mathbf{W}_{rr} \mathbf{x}_r + \mathbf{x}_r^T \mathbf{W}_{ra} \mathbf{x}_a \right)$$

Now, the "ad-only" score $$\mathbf{w}_a^T \mathbf{x}_a + \mathbf{x}_a^T \mathbf{W}_{aa} \mathbf{x}_a$$ can be pre-computed and cached for each ad.
 When a request comes in, we can compute the "request-only" score $$\mathbf{w}_r^T \mathbf{x}_r + \mathbf{x}_r^T \mathbf{W}_{rr} \mathbf{x}_r$$
 with $O(d_r^2)$ operations.
 To score that request again each of $n$ ads, all that remains is to compute the "ad-request" score 
 $$\mathbf{x}_r^T \mathbf{W}_{ra} \mathbf{x}_a^i$$ for each ad $i = 1 ... n$.
 
At first glance it might look like that task will take $O(n \, d_r \, d_a)$ time.
But since we know all ads in the inventory in advance, we can precompute and cache $$\mathbf{W}_{ra} \mathbf{x}_a^i$$
for all ads $i$.
Computing the ad-request score for a single ad/request pair is therefore a $O(d_r)$ operation, and doing so for all ads takes time $O(n \, d_r)$.

Therefore, we can score the request against all $n$ ads with just $O(d_r^2 + n d_r)$ operations.
