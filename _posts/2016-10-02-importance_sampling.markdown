---
layout: post
title:  "Estimating the Accuracy of a Classifier with Importance Sampling"
date:   2016-10-02 10:00:00
categories: 
---

<script src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML'></script>
<script type="text/x-mathjax-config">
MathJax.Hub.Config({
  tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},
  TeX: { equationNumbers: { autoNumber: "AMS" } }
});
</script>

I'm trying to measure the accuracy of a trained classifier over a very large test set.  The data points do not have labels, but can be manually labeled by a human at some expense.  While labeling every data point would be impractical, labeling a few hundred or so is fine.

The most obvious way to measure accuracy would be to sample some data points uniformly at random from the large test set, manually label them, and report the classifier's accuracy over the sample.

Suppose, however, that instead of sampling from the test data set uniformly at random, we take a weighted sample in which some data points are more likely to be selected than others.  This raises the following two questions: 

(1) How can we estimate the classifier's accuracy over the whole test dataset based only on its accuracy over a weighted sample?

(2) How confident are we that whatever estimate we make is close to the true classifier accuracy?  In other words, due to the randomness induced by the sampling, the estimator is a random variable -- what, then, is its variance?

## Definitions

Suppose that there are $n$ data points in the very large test set, and let $$x_i \in \{0, 1\}$$ represent whether or not our classifier is correct on data point $i$.

Our goal is to estimate the overall accuracy
$$ \bar{x} = \frac{1}{n} \sum_{i=1}^n x_i $$
based only on a random sample of size $m$ consisting of data points $i_1$ through $i_m$ with each $i_j$ drawn i.i.d from some arbitrary discrete distribution over the test data points $q$.

## Question 1: an unbiased estimator for the classifier's accuracy

It turns out that an unbiased estimator for the classifier's accuracy $\bar{x}$ is given by:

$$
\begin{align}
\tilde{x} = \frac{1}{m} \sum_{j=1}^m \frac{x_{i_j}}{n \, q_{i_j}}
\end{align}
$$

In other words, we _downweight_ data points that were more likely to occur under our weighted sample than under a uniform sample, and _upweight_ data points that were less likely to occur under our bised sample than under a uniform sample.

The random variable $\tilde{x}$ is an "unbiased" estimator for $\bar{x}$ in the sense that $\mathbb{E}[\tilde{x}] = \bar{x}$, where the expectation is taken over the sampling of each $i_j \sim q$.


$$
\begin{align*}
\mathbb{E} \left[ \tilde{x} \right] &= \mathbb{E} \left[ \frac{1}{m} \sum_{j=1}^m \frac{x_{i_j}}{n \, q_{i_j}} \right] \\
&= \mathbb{E}_{i \sim q} \left[ \frac{x_{i}}{n \, q_{i}} \right] \tag{the $\{i_j\}$ are iid}  \\
&= \sum_{i=1}^n \frac{x_{i}}{n \, q_{i}} q_i \tag{definition of expectation}\\
&= \frac{1}{n} \sum_{i=1}^n x_i
\end{align*}
$$

This scheme is an example of [importance sampling](https://en.wikipedia.org/wiki/Importance_sampling).
If you want to learn more, a good resource is Sheldon Ross's book [Simulation](https://www.amazon.com/Simulation-Fifth-Sheldon-M-Ross/dp/0124158250/).

## Question 2: the variance of this estimator

It turns out that the variance of the estimator $\tilde{x}$ as defined above is:

$$ 
\begin{align}
\text{Var}(\tilde{x}) = \frac{1}{m} \left[\underbrace{\frac{1}{n} \sum_{i=1}^n \frac{x_i}{n \, q_i}}_{\text{weighted accuracy}} - \underbrace{\left( \frac{1}{n} \sum_{i=1}^n x_i  \right)^2}_{\text{accuracy squared}} \right]
\end{align}
$$

I call $\frac{1}{n} \sum_{i=1}^n \frac{x_i}{n \, q_i}$ the "weighted accuracy" because it is the accuracy inversely weighted by the probability that each data point is drawn from the distribution $q$.

The derivation of equation (2) is:

$$
\begin{align*}
\text{Var}(\tilde{x}) &= \text{Var} \left[ \frac{1}{m} \sum_{j=1}^m \frac{x_{i_j}}{n \, q_{i_j}} \right] \\
&=  \frac{1}{m^2} \text{Var} \left[ \sum_{j=1}^m \frac{x_{i_j}}{n \, q_{i_j}} \right] \tag{multiply by constant} \\
&= \frac{1}{m} \text{Var}_{i \sim q} \left[\frac{x_{i}}{n \, q_{i}} \right] \tag{the $\{i_j\}$ are iid} \\
&= \frac{1}{m} \left[ \text{E}_{i \sim q} \left[\left( \frac{x_{i}}{n \, q_{i}} \right)^2 \right] - \mathbb{E}_{i \sim q} \left[ \frac{x_{i}}{n \, q_{i}} \right]^2  \right] \tag{definition of variance} \\
&= \frac{1}{m} \left[ \frac{1}{n^2} \sum_{i=1}^n \frac{x_i^2}{q_i^2} q_i  - \left(\sum_{i=1}^n \frac{x_{i}}{n \, q_{i}} q_i \right)^2  \right] \tag{definition of expectation} \\
&= \frac{1}{m} \left[\underbrace{\frac{1}{n} \sum_{i=1}^n \frac{x_i}{n \, q_i}}_{\text{weighted accuracy}} - \underbrace{\left( \frac{1}{n} \sum_{i=1}^n x_i  \right)^2}_{\text{accuracy squared}} \right]
\end{align*}
$$

But there's a catch: in practice, we could never compute $\text{Var}(\tilde{x})$ exactly because we don't know how our classifier did on data points outside of the labeled sample of size $m$ -- using our notation, we don't know $x_i$ for $$i \not \in \{i_1 ... i_m \}$$.

Therefore, the best we can do is to replace the accuracy and weighted accuracy over the entire dataset with their realizations over the sample:

$$ \text{Var}(\tilde{x}) \approx \frac{1}{m} \left[\underbrace{\frac{1}{m} \sum_{j=1}^m \frac{x_{i_j}}{n \, q_{i_j}}}_{\text{weighted accuracy}} - \underbrace{\left( \frac{1}{m} \sum_{j=1}^m x_{i_j}  \right)^2}_{\text{accuracy squared}} \right]  $$

*TODO*: show simulation results
