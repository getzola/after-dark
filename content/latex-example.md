+++
title = "LaTeX Example" 
date = 2017-09-24

[taxonomies]
categories = ["demo"]
tags = ["latex", "example"]
+++

This theme allows you to use MathJax directly in your Markdown! Click on this
article to see some fancy math in action. Little teaser:
$ x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} $

<!-- more -->

Some fancy math thingy:

$$
\begin{align*}
\frac{d}{dx} \left( \int_{0}^{x} f(u) \, du \right) &= f(x) \\
\frac{d}{dx} \left( \int_{g(x)}^{h(x)} f(u) \, du \right) &= f(h(x))h'(x) - f(g(x))g'(x)
\end{align*}
$$

Isn't that cool?!

---

## Another cool thingy

We will prove this statement by induction on $h$.

### Base Case: $h = 0$

The AVL tree of height 0 has no nodes, so $N_0 = 0$. The Fibonacci number $F_{0+2} = F_2 = 1$. Therefore,

$$
N_0 = 0 \geq F_2 - 1 = 1 - 1 = 0
$$

which holds true.

### Base Case: $h = 1$

The AVL tree of height 1 has one node, so $N_1 = 1$. The Fibonacci number $F_{1+2} = F_3 = 2$. Therefore,

$$
N_1 = 1 \geq F_3 - 1 = 2 - 1 = 1
$$

which holds true.

### Inductive Step:

Assume the claim holds true for $h = k$. That is,

$$
N_{k} \geq F_{k+2} - 1 \tag{I.H.}
$$

For $h = k+1$, we know:

$$
N_{k+1} = N_{k} + N_{k-1} + 1 \tag{def. of $N_h$}
$$

From the inductive hypothesis, $N_{k} \geq F_{k+2} - 1$ and $N_{k-1} \geq F_{k+1} - 1$. Substituting:

$$
N_{k+1} = N_{k} + N_{k - 1} + 1 \geq (F_{k+2} - 1) + (F_{k+1} - 1) + 1
$$

Thus, we get:

$$
N_{k+1} \geq F_{k+2} + F_{k+1} - 1
$$

By the definition of Fibonacci numbers:

$$
N_{k+1} \geq F_{k+3} - 1 \tag{def. of Fibonacci}
$$

By the principle of mathematical induction, the statement holds for all $h \geq 0$.
