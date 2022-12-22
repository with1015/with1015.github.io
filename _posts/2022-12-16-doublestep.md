---
layout: post
title: DoubleStep
info: ML system
tech: PyTorch, ML, Network
type: Research
---

DoubleStep: Efficient Gradient Compression in Distributed DNN Training System

In a few years, the machine learning model has shown steeper growth in a lot of industry fields. Accordingly, the required data and model size have also increased, so there need to support large-scale training in the distributed environment. To make connections among GPU resource nodes, the role of the network and communication scheme also become important. As the hardware resource cannot follow the model size growth, the network resource undergoes communication bottleneck easily, due to gradient exchange. To solve this problem, a lot of gradient compression(GC) algorithms have been suggested. However, compression algorithms have difficulties at the framework level, since they have compression overhead and communication topology problems. To solve these challenges, this work suggests $DoubleStep$, which supports gradient compression algorithms with minimized compression and communication overhead. $DoubleStep$ uses multi-stream with parallel kernel launch of compress operation and on-demand decompression policy to utilize surplus GPU resources in training time. Moreover, its two-stage bucket system minimizes the number of communication times. Through these components, $DoubleStep$ shows an improvement of throughput up to 41\% than previous works in the inter-node cluster.
