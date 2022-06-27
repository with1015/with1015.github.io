---
layout: post
title: HFTA-NLP
info: Natural language process
tech: PyTorch, ML, Network
type: Research
---

[Github link](https://github.com/with1015/HFTA-NLP/tree/nlp_version)

HFTA-NLP: Enabling Horizontally Fused Training Array on Natural Language Processing Models

These days, deep learning has become an essential part in many domains such as image classification, speech recognition and text processing. This have inevitably led to the increase of deep learning model size as well as the input data size to enhance accuracy. Though large models give chance for high accuracy, it requires a huge amount of time for finding an optimal setting, so-called hyper-parameter tuning. To reduce such hyper-parameter tuning time, many researches have been conducted with each of them having its own novel approach and strategy. In this project, we give attention to one recent work that is based on the concurrent execution approach. This work aims to enhance the given hardware utilization by suggesting a new deep learning framework extension library named HFTA. HFTA horizontally fuses the models from different repetitive jobs deeply down to tensor operator level and then trains them simultaneously on a shared accelerator. Despite the strengths of HFTA, the framework is limited to CNN models and is not applicable to language models. Therefore, the research goal of our project is to expand HFTA to HFTA-NLP which is applicable to language models. As a result, HFTA-NLP achieves 23\% faster training time than naive concurrent execution at maximum, while saving up to x2 memory.
