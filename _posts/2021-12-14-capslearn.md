---
layout: post
title: CaPS-Learn
info: A.I. Framework project
tech: PyTorch, ML, Network
type: Research
---

[Github link] (https://github.com/with1015/CaPS-Learn)

CaPS-Learn: Convergence-aware Parameter Skipped Learning System in Distributed Environment

PyTorch optimizer to reduce communication overhead by discarding useless parameter updates, which does not expected to affect convergence. CaPS optimizer traces all parameter updates by using several criteria with user-defined threshold, and dynamic threshold scheduler can control its threshold to avoid local minima.
