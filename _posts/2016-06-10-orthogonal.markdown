---
layout: post
title:  "Sparse Orthogonal Regression"
date:   2016-06-10 10:00:00
categories: 
---

<script src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML'></script>
<script type="text/x-mathjax-config">
MathJax.Hub.Config({
  tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},
  TeX: { equationNumbers: { autoNumber: "AMS" } }
});
</script>

<style type="text/css">

div.image {
	margin-left: 40px; 
	width: 400px; 
	margin-bottom: 30px;
	margin-top: 20px;
}

div.image span.caption {
	clear: left; 
	text-align: left; 
	margin-top: 10px;
	font-size: 12px;

}

/*span.caption {
	float: left;
	font-size: 14px; 
 	margin-top: 5px;
	line-height: 16px;
}*/
</style>

$$
\newcommand{\reals}{\mathbb{R}}
\newcommand{\prox}{\textbf{prox}}
\DeclareMathOperator*{\argmin}{arg\,min}
\DeclareMathOperator*{\argmax}{arg\,max}
 $$

I've recently spent some time figuring out how to efficiently solve the following optimization problem:

$$ \begin{equation} 
\label{main}
 \argmin_{\mathbf{B}} \; \; \frac{1}{2} \| \mathbf{Y} - \mathbf{X} \mathbf{B} \|^2_F +  \lambda \, \|\mathbf{B}\|_1 \quad \text{subject to} \quad \mathbf{B} \mathbf{B}^T = I \end{equation}
  $$

where the element-wise $$\ell_1$$ penalty $$\| \mathbf{B}\|_1 = \sum_{i,j} \vert B_{ij} \vert $$ is meant to promote sparsity in $$\mathbf{B}$$ and the orthogonality constraint $$  \mathbf{B} \mathbf{B}^T = I $$ ensures that the rows of $$\mathbf{B}$$ are orthonormal.

Our motivation is a neuroscience fMRI application: $$\mathbf{Y}$$ is a person's brain activity, stored in a `time x voxels` matrix, $$\mathbf{X}$$ is the `time x covariates` experimental design matrix, and we'd like to solve for $$\mathbf{B}$$, a `covariates x voxels` matrix, each row of which is the "brain system" associated with a covariate.

The orthogonality constraint $$\mathbf{B} \mathbf{B}^T = I$$ drives the brain systems for different covariates to be distinct from one another, and the sparsity penalty $$\| \mathbf{B}\|_1$$ encourages each brain system to be nonzero at only a few voxels, which improves both interpretablily and generalization.

PICTURES

Without the orthogonality constraint, we'd have a standard $$\ell_1$$-regularized least squares regression problem.
Coversely, without the sparsity penalty, the problem is called the "[orthogonal procrustes problem](https://en.wikipedia.org/wiki/Orthogonal_Procrustes_problem)," and has an analytical solution $$ \hat{\mathbf{B}} = \mathbf{V} \mathbf{U}^T $$, where $$\mathbf{U} \boldsymbol{\Sigma} \mathbf{V}^T$$ is the singular value decomposition of $$ \mathbf{Y}^T \mathbf{X} $$ (see proof).

Theorem: 

$$  \argmin_{\mathbf{B} \mathbf{B}^T = \, I} \; \; \| \mathbf{Y} - \mathbf{X} \mathbf{B} \|^2_F  = \mathbf{V} \mathbf{U}^T  \quad \text{where} \quad  \mathbf{U} \boldsymbol{\Sigma} \mathbf{V}^T = \mathbf{Y}^T \mathbf{X}$$

Proof:

First, notice that due to the orthogonality constraint, one of the terms in our objective function is constant:

$$ \begin{align*}
 \| \mathbf{Y} - \mathbf{X} \mathbf{B} \|^2_F &= \text{Tr}((\mathbf{Y} - \mathbf{X} \mathbf{B} )^T (\mathbf{Y} - \mathbf{X} \mathbf{B} )) \\
&= \text{Tr}(\mathbf{Y}^T \mathbf{Y}) - 2 \text{Tr}(\mathbf{Y}^T \mathbf{X} \mathbf{B}) + \text{Tr}(\mathbf{B}^T \mathbf{X}^T \mathbf{X} \mathbf{B}) \\
&= \text{Tr}(\mathbf{Y}^T \mathbf{Y}) - 2 \text{Tr}(\mathbf{Y}^T \mathbf{X} \mathbf{B}) + \text{Tr}(\mathbf{X}^T \mathbf{X} \mathbf{B} \mathbf{B}^T ) \\
&= \text{Tr}(\mathbf{Y}^T \mathbf{Y}) - 2 \text{Tr}(\mathbf{Y}^T \mathbf{X} \mathbf{B}) + \text{Tr}(\mathbf{X}^T \mathbf{X})
\end{align*} 
$$


Hence, our problem reduces to a linear maximization problem:

$$ \argmax_{\mathbf{B} \mathbf{B}^T = \, I} \; \; \text{Tr}(\mathbf{Y}^T \mathbf{X} \mathbf{B}) $$

First, we'll give an upper bound on this problem. Then, we'll show that $$\hat{\mathbf{B}} = \mathbf{V} \mathbf{U}^T$$ attains this upper bound.
The upper bound uses [Von Neummann's trace inequality](https://en.wikipedia.org/wiki/Trace_inequalities#Von_Neumann.27s_trace_inequality) and the fact that $$\mathbf{B} \mathbf{B}^T = I$$ implies that all singular values of $$\mathbf{B}$$ are one.

$$ \begin{align*}  \text{Tr}(\mathbf{Y}^T \mathbf{X} \mathbf{B}) &\le \sum_i \sigma_i(\mathbf{Y}^T \mathbf{X}) \, \sigma_i(\mathbf{B})  \tag{Von Neumann} \\
&= \sum_i \sigma_i(\mathbf{Y}^T \mathbf{X}) \tag{$\sigma_i(\mathbf{B}) = 1$}
\end{align*}$$
Finally, to check that $$\hat{\mathbf{B}}$$ attains this optimal value, we compute

$$ \text{Tr}(\mathbf{Y}^T \mathbf{X} \hat{\mathbf{B}}) =  \text{Tr}(\mathbf{U} \boldsymbol{\Sigma} \mathbf{V}^T \mathbf{V} \mathbf{U}^T) = \text{Tr}(\boldsymbol{\Sigma})$$


However, with both the orthogonality constraint and the $$\ell_1$$ penalty, it's not immediately apparent how we can solve the problem -- notice that the orthogogonality constraint makes the feasible set non-convex.
I've found two approaches that seem to work:

1. the alternating direction method of multipliers (ADMM)
1. gradient descent on the Stiefel manifold

ADMM
----

The alternating direction method of multipliers solves unconstrained optimization problems where the objective function separates across multiple terms whose variables are linked by linear constraints:

$$ \begin{equation} \label{admm1} \argmin_{x_1, \ldots_, x_n} \quad f(x_1, \ldots, x_n) = \sum_{i=1}^n f_i(x_i) \quad \text{subject to} \quad \sum_{i=1}^n A_i x_i = 0 \end{equation}$$

Notice that this formulation subsumes problems of the form:

$$ \begin{equation} \label{admm2} \argmin_{x} \quad f(x) = \sum_{i=1}^n f_i(x) \end{equation} $$

as (\ref{admm2}) reduces to (\ref{admm1}) for some choice of $$A_1 \ldots A_n$$.

Each step of ADMM involves computing the so-called "proximal operator" of some $$f_i$$.  The proximal operator of a function $$f_i$$ is itself an optimization problem:

$$ \prox_{f_i}(x) =  \argmin_y \; \frac{1}{2} \| x - y \|^2_2 + f_i(y) $$

Some functions $$f_i$$ are "proximable" in the sense that the solution to this optimization problem can be computed efficiently in closed form.
ADMM is especially well-suited to situations where $$f$$ is a sum of proximable functions.

There is more than one way to split the objective function in problem (\ref{main}) into a sum of proximable functions, and each of these splittings gives rise to a different ADMM algorithm.

### Splitting \# 1

One possible splitting is as follows:

$$
\begin{equation} 
 \argmin_{\mathbf{B}} \; \; \underbrace{\frac{1}{2} \| \mathbf{Y} - \mathbf{X} \mathbf{B} \|^2_F}_{f_1(\mathbf{B})} + \underbrace{\mathbf{1}_{\mathbf{B} \mathbf{B}^T = \, I}(\mathbf{B})}_{f_2(\mathbf{B})} + \underbrace{\alpha \, \|\mathbf{B}\|_1}_{f_3(\mathbf{B})}  \end{equation}
$$

where $$\mathbf{1}_{\mathbf{B} \mathbf{B}^T = \, I} $$ is the indicator function for the set $$\{\mathbf{B} : \mathbf{B} \mathbf{B}^T = \, I \} $$, defined as

$$\mathbf{1}_{\mathbf{B} \mathbf{B}^T }(\mathbf{B}) =  \begin{cases}
0 &\mbox{ if } \mathbf{B} \mathbf{B}^T = I \\
 \infty &\mbox{ otherwise }
\end{cases} $$

We need to derive the proximal operators of $$f_{1 \cdots 3}$$.

Since $$f_1$$ is convex, the optimization problem defined by its proximal operator is also convex and therefore a minimizer can be computed analytically by setting the gradient to zero.  The result is:

$$ \begin{align*} \prox_{\lambda f_1}(\mathbf{B}) &= \argmin_{C} \; \frac{1}{2} \| \mathbf{Y} - \mathbf{X} \mathbf{C} \|^2_F + \frac{1}{2 \lambda} \| \mathbf{B} - \mathbf{C} \|^2_F \\
&= \left( \mathbf{X}^T \mathbf{X} + \frac{1}{2 \lambda} I \right)^{-1} \left( \mathbf{X}^T \mathbf{Y} + \frac{1}{\lambda} \mathbf{B}  \right)
  \end{align*}$$

The proximal operator of $$f_2$$ is just a projection onto the set $$\{\mathbf{B} : \mathbf{B} \mathbf{B}^T = \, I \} $$, which is a special case of the procrustes problem:

$$ \begin{align*} \prox_{\lambda f_2}(\mathbf{B}) &= \argmin_{\mathbf{C}: \, \mathbf{C} \mathbf{C}^T = \, I} \; \| \mathbf{B} - \mathbf{C} \|^2_F \\
&= \mathbf{U} \mathbf{V}^T \quad \text{where} \quad \mathbf{U} \boldsymbol{\Sigma} \mathbf{V}^T = \mathbf{B}
  \end{align*}$$

Finally, the proximal operator of the sparsity-inducing penalty $$f_3(\mathbf{B}) = \alpha \|\mathbf{B}\|_1$$ is the "soft-thresholding operator," so named because it sets values in $$[-\alpha \lambda, \alpha \lambda]$$ to zero, and shrinks all other values towards zero:


$$ \begin{align*} \prox_{\lambda f_3}(\mathbf{B}) &= \argmin_{C} \; \alpha \, ||\mathbf{B}||_1 + \frac{1}{2 \lambda} \| \mathbf{B} - \mathbf{C} \|^2_F \\
& \Downarrow \hspace{150px}  \Downarrow \\
(\prox_{\lambda f_3}(\mathbf{B}))_{ij} &= 
\begin{cases}
B_{ij} - \alpha \lambda &\mbox{ if } B_{ij} > \alpha \lambda \\
0 &\mbox - \alpha \lambda \le B_{ij} \le \alpha \lambda \\
B_{ij} + \alpha \lambda &\mbox{ if } B_{ij} < - \alpha \lambda
\end{cases}
  \end{align*}$$

The ADMM algorithm is to repeat the following operations until convergence:
$$
\begin{align*}
\quad \mathbf{B}_2 &\leftarrow \prox_{\rho f_2}( \mathbf{B} +\mathbf{U}_2) \\
\quad \mathbf{B}_3 &\leftarrow \prox_{\rho f_3}( \mathbf{B} +\mathbf{U}_3) \\
\quad \mathbf{B} &\leftarrow \prox_{2 \rho f_1 } \left(\frac{1}{2}(\mathbf{B}_2 + \mathbf{B}_3 -\mathbf{U}_2 - \mathbf{U}_3) \right) \\
\quad \mathbf{U}_2 &\leftarrow \mathbf{U}_2 + \mathbf{B} - \mathbf{B}_2 \\
\quad \mathbf{U}_3 &\leftarrow \mathbf{U}_3 + \mathbf{B} - \mathbf{B}_3 \\
\end{align*}
$$

### Splitting \# 2

An alternative splitting of our objective function is

$$
\begin{equation} 
 \argmin_{\mathbf{B}} \; \; \underbrace{\frac{1}{2} \| \mathbf{Y} - \mathbf{X} \mathbf{B} \|^2_F + \mathbf{1}_{\mathbf{B} \mathbf{B}^T = \, I}(\mathbf{B}) }_{g_1(\mathbf{B})} + \underbrace{\alpha \, \|\mathbf{B}\|_1}_{g_2(\mathbf{B})}  \end{equation}
$$

The proximal operator of $$g_1$$ is a special case of the procrustes problem:

$$ \begin{align*} \prox_{\lambda g_1}(\mathbf{B}) &= \argmin_{\mathbf{C} \mathbf{C}^T = \, I} \; \frac{1}{2} \| \mathbf{Y} - \mathbf{X} \mathbf{C} \|^2_F + \frac{1}{2 \lambda} \| \mathbf{B} - \mathbf{C} \|^2_F \\
&= \argmin_{\mathbf{C} \mathbf{C}^T = \, I} \; \left \| \begin{bmatrix} \mathbf{Y} \\ \sqrt{\lambda} \, \mathbf{B} \end{bmatrix} - \begin{bmatrix} \mathbf{X} \\ \sqrt{\lambda} \, I \end{bmatrix} \mathbf{C} \right \|^2_F   \\
&= \mathbf{V} \mathbf{U}^T \quad \text{where} \quad \mathbf{U} \boldsymbol{\Sigma} \mathbf{V}^T = \mathbf{Y}^T \mathbf{X} + \lambda \mathbf{B}^T 
  \end{align*}$$

The ADMM algorithm is to repeat the following operations until convergence:
$$
\begin{align*}
\mathbf{B}_1 &\leftarrow \prox_{\rho g_1 } \left( \mathbf{B}_2 - \mathbf{U} \right)  \\
\mathbf{B}_2 &\leftarrow \prox_{\rho g_2}( \mathbf{B}_1 +\mathbf{U}) \\
\mathbf{U} &\leftarrow \mathbf{U} + \mathbf{B}_1 - \mathbf{B}_2  \\
\end{align*}
$$



Manifold gradient descent
-----

An alternative way to solve ($$\ref{main}$$) is to apply the machinery of manifold optimization.  The set $$\mathcal{M}$$ of matrices with orthonormal columns $$ \mathcal{M} = \{\mathbf{A} \in \reals^{n \times p}: \mathbf{A}^T \mathbf{A} = \, I\}$$ is a matrix manifold called the "Stiefel manifold."  In their recent book, [Absil, Mahoney, and Sepulchre](http://press.princeton.edu/chapters/absil/) develop a general framework for optimization over matrix manifolds, which we will follow here.

Letting $$\mathbf{A} = \mathbf{B}^T$$, we can view $$(\ref{main})$$ as an optimization problem over the Stiefel manifold:

$$
\begin{align}
\argmin_{\mathbf{A} \in \mathcal{M}} \quad  \frac{1}{2} \| \mathbf{Y} - \mathbf{X} \mathbf{A}^T \|^2_F +  \lambda \, \|\mathbf{A}\|_1 
\end{align}
$$

Manifold optimization algorithms require a smooth objective function, so we will replace the non-smooth $$\ell_1$$ norm with a smooth approximation parameterized by $\epsilon > 0$:

$$ |x| \approx \sqrt{x^2 + \epsilon^2} - \epsilon $$

<div class="image">
<img src="/images/l1approx.jpg"/>
<span class="caption">$|x|$ (top) and smooth approximation to $|x|$ (bottom).</span>
</div>

The new optimization problem is:

$$
\begin{align}
\argmin_{\mathbf{A} \in \mathcal{M}} \quad  \frac{1}{2} \| \mathbf{Y} - \mathbf{X} \mathbf{A}^T \|^2_F +  \lambda \, \sum_{i, j} \left( \sqrt{A_{ij}^2 + \epsilon^2} - \epsilon \right)
\end{align}
$$

In standard numerical optimization over $\reals^{n \times p}$, a descent method for minimizing a function $$f(\mathbf{A}): \reals^{n \times p} \to \reals$$ would proceed as follows: in each iteration $k$, choose a search direction $$ \mathbf{D}_k$$ and a step size $$\alpha_k$$, and take a step as:

$$ \mathbf{A}_{k+1} \leftarrow \mathbf{A}_k + \alpha_k \mathbf{D}_k $$

In gradient descent, the search direction is the negative gradient $$\mathbf{D}_k = - \nabla f(\mathbf{A})$$, and the step size is often chosen by a line search.

On a manifold, things get a little trickier: some search directions wouldn't make any sense because they would take us away from the manifold.
Therefore, we restrict ourselves to directions $$\boldsymbol{\zeta}$$ which are "tangent" to $$\mathcal{M}$$ at $$\mathbf{A}_k$$.
Formally, $$\boldsymbol{\zeta}$$ is called a "tangent vector" of $$\mathcal{M}$$ at $$\mathbf{A}_k$$ if it is the derivative at $$\mathbf{A}_k$$ of some smooth curve on $$\mathcal{M}$$.
The set of all tangent vectors is called the "tangent space" of $$\mathcal{M}$$ at $$\mathbf{A}_k$$ and is denoted $$T_{\mathbf{A}_k}\mathcal{M}$$.
The tangent space is a vector space closed under addition and scalar multiplication, so any step $$ \mathbf{A}_{k+1} \leftarrow \mathbf{A}_k + \alpha_k \boldsymbol{\zeta} $$ will end up in the tangent space.

The picture below illustrates a tangent space:

<div class="image">
<img src="/images/tangent.png"/>
<span class="caption">The tangent space of a manifold $\mathcal{M}$ at a point $x$.  $u$ is a tangent vector because it is the derivative of a curve $\gamma(t)$ at $x$ (Wikipedia).</span>
</div>

The tangent space of the Stiefel manifold at $$\mathbf{A} \in \reals^{n \times p}$$ is:

$$ T_{\mathbf{A}} \mathcal{M} = \{\mathbf{B} \in \reals^{n \times p}: \mathbf{A}^T \mathbf{B} + \mathbf{B}^T \mathbf{A} = 0  \}$$

As in the Euclidean case, the directional derivative $$Df[\boldsymbol{\boldsymbol{\zeta}}]$$ of a function $$f$$ at a point $$\mathbf{A}$$ along a tangent vector $$\boldsymbol{\boldsymbol{\zeta}}$$ is defined as

$$ Df[\boldsymbol{\zeta}] = \lim_{t \to 0} \frac{f(\mathbf{A} + t \boldsymbol{\zeta}) - f(\mathbf{A})}{t} $$

Similarly, the gradient $$\nabla f(\mathbf{A}_k)$$ is defined as the direction of steepest ascent --- the element of the tangent space with the largest directional derivative:

$$ \frac{\nabla f(\mathbf{A})}{\|\nabla f(\mathbf{A}) \|} = \argmax_{\boldsymbol{\zeta} \in T_{\mathcal{M}}(\mathbf{A}), \ \| \zeta \| = 1} Df[\boldsymbol{\zeta}]$$
 
As in $$\reals^{n\times p}$$, a norm $$\| \cdot \|$$ is induced by an inner product $$g(\cdot, \cdot)$$ as $$ \|\zeta\| = \sqrt{g(\zeta, \zeta)}$$.
On the Stiefel manifold, we may take the inner product to be $$g(\mathbf{A}, \mathbf{B}) = \text{Tr}(\mathbf{A}^T \mathbf{B})$$.
With this choice of inner product, if $$f =\bar{f}|_{\mathcal{M}}$$ is a function $$\bar{f}: \reals^{n \times p} \to \reals$$ restricted to the Stiefel manifold, and $$\nabla \bar{f}$$ is the gradient of $$\bar{f}$$ in $$\reals^{n \times p}$$, then the gradient of $$f$$ on the Stiefel manifold turns out to be the orthogonal projection $$P$$ of $$\nabla \bar{f}$$ onto the tangent space of $$\mathcal{M}$$:

$$ \nabla f(\mathbf{A}) = P_{T_{\mathcal{M}}(\mathbf{A})}(\nabla \bar{f}(\mathbf{A})) $$

This projection can be computed as:

$$ P_{T_{\mathcal{M}}(\mathbf{A})}(\mathbf{B}) = \mathbf{B}  - \mathbf{A} \, \text{sym}(\mathbf{A}^T \mathbf{B})$$

where $$\text{sym}(\mathbf{Z})=\frac{1}{2}(\mathbf{Z} + \mathbf{Z}^T)$$ is the symmetric part of $$\mathbf{Z}$$.

We know we want to take a step in the search direction $$-\nabla f(\mathbf{A}_k)$$, but we cannot simply step to $$\mathbf{A}_k - \alpha_k \nabla f(\mathbf{A}_k)$$, since that point may not lie on the manifold.
We therefore make use of a "retraction" mapping $$R_{\mathbf{A}}: T_{\mathbf{A}} \mathcal{M} \to \mathcal{M}$$ from the tangent space of $$\mathcal{M}$$ back to $$\mathcal{M}$$.
Each iteration of gradient descent proceeds as $$\mathbf{A}^{k+1} \leftarrow R_{\mathbf{A}_k}(- \alpha_k \nabla f(\mathbf{A}_k)) $$, where the step size $$\alpha_k$$ is chosen using an Armijo line search rule.

<div class="image">
<img src="/images/retract.png"/>
<span class="caption">A retraction $R_x(\zeta)$ maps vectors $\zeta$ in the tangent space of $\mathcal{M}$ at $x$ back to the manfold $\mathcal{M}$ (illustration from Absil, Mahoney, and Sepulchre).</span>
</div>


Provided that the retraction satisfies certain properties, gradient descent on a matrix manifold is guaranteed to converge to a critical point.
One valid retraction on the Stiefel manifold is given by:

$$ R_{\mathbf{A}}(\mathbf{B}) = (\mathbf{A} + \mathbf{B})(I + \mathbf{B}^T \mathbf{B})^{- \frac{1}{2}} $$

