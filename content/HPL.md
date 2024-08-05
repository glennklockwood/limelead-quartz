---
title: High-Performance Linpack
tags:
  - benchmark
---
High-performance Linpack is the industry-standard benchmark for FP64 performance of supercomputers.[^1] It is the basis for the [Top500](https://www.top500.org/) list.

## What it does

It solves a linear system of $N$ equations using LU decomposition with partial pivoting. On paper, solving this problem requires a well-defined number of floating point operations:

$FLOPS = \frac{2}{3} N^3 + 2N^2$

So HPL is able to calculate the maximum FLOPS a supercomputer can process ($R_{max}$) using:

$R_{max} = \frac{\text{num flops}}{\text{walltime}} = \left ( \frac{2}{3} N^3 + 2N^2 \right ) \times \frac{1}{t}$

The [Top500 list's raw data](https://top500.org/lists/top500/2024/06/download/TOP500_202406.xlsx) includes both $R_{max}$ and $N$ for every submission, so using that information, you can tell how long it took for each HPL run to complete.

## Predicting performance

In my experience on supercomputers with fat tree interconnect topologies, HPL scales linearly with node count. If you know how many FLOPS a specific combination of compute node and interconnect got at multiple scales, you can linearly extrapolate the peak FLOPS of any supercomputer with that same architecture.

The Top500 list often contains multiple supercomputers with the same GPUs and interconnects, so there should be enough information to predict HPL scores for any system of any size. You can see how to do this using [a script I wrote to predict H100 cluster performance](https://github.com/glennklockwood/atgtools/blob/master/estimate_hpl.py).

[^1]: [HPL Benchmark (utk.edu)](https://icl.utk.edu/hpl/)