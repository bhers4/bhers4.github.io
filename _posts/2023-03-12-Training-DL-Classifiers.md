---
layout: post
preview: "CIFAR10 Classification with Deep Learning Models"
title:  "CIFAR10 Classification with State-Of-The-Art Deep Learning Models"
date:   2023-03-12 12:00:00 -0700
categories: 
    - "deep_learning"
tags: python deep_learning classification transformers cnns
---
As I finished up my Masters degree where I studied deep learning in biomedical imaging, I had read
a lot of papers on different state-of-the-art(SOTA) models yet hadn't had a chance myself to compare
them firsthand. I wanted to use CIFAR10 which is a simple classification dataset with 10 separate 
classes to compare them since the images were smaller than ImageNet which means training would 
require less memory and smaller GPUs for similar batch sizes. In this blog post I compare the 
following SOTA models
- Resnet Models: Resnet18, Resnet34, and Resnet50
- EfficientNet Models: Efficientnet_b0, and Efficientnet_b1
- Swin Transformer Models: Swin Transformer Small, and Swin Transformer Tiny
- Mobilenet Models: Mobilenetv2
- Vision Transformers(ViT)**

** The ViT's I left out of the graphics since holding all things equal in terms of data augmentations and training procedure, I got inferior performance compared to other models.

## Training Setup
To start I implemented the 3 basic Resnet models, with no data augmentations other than just 
normalizing the images to the same mean and std. The models very quickly overfit to the training 
data and jumped right to 100% for Top-1 accuracy on the training data. Even though the training 
accuracy was 100% I got the following results.
- Resnet18: 77.04% Top-1 Accuracy
- Renset34: 78.4% Top-1 Accuracy
- Resnet50: 76.2% Top-1 Accuracy


## Adding Improvements
As is common in deep learning, we can add in techniques such as data augmentations, dropout layers, and architectural tweaks to help improve the test performance. I systemically added in improvements and studied how they effected performance.
### Adding Dropout and Tweaks
The first step to potentially improve the test performance and decrease the train/test gap in performance, I added in dropout layers inside the Resnet models where I dropped 10% of the values in each dropout layer. Also to help gradients better propagate through the network I swapped in leaky ReLU layers instead of normal ReLU layers. I found the following small improvements:
- Resnet18: 78.26%(+1.22%) Top-1 Accuracy
- Resnet34: 78.5%(+0.1%) Top-1 Accuracy
- Resnet50: 77.0%(+0.8%) Top-1 Accuracy

I checked if adding in even more dropout would help the network, I upped the dropout percentage to 20%, but didn't see any noticeable change in performance over 10%
### Data Augmentations
I knew dropout alone wouldn't solve the train/test gap issue, so I added in many data augmentations to ensure the network learn more robust features and see all types of transformed images. I added the following code block in the DataLoader:
``` python
transforms.Compose(
    [
    transforms.Pad(padding=5),
    transforms.RandomCrop((32, 32)),
    transforms.RandomApply(torch.nn.ModuleList(
    [
        transforms.ColorJitter(),
        transforms.RandomRotation(degrees=(0, 180)),
        transforms.RandomAffine(degrees=0, translate=(0.1, 0.3), scale=(0.5, 0.75)),
        transforms.RandomPerspective(),
        transforms.ElasticTransform(alpha=250.0),
        transforms.RandomSolarize(threshold=192.0),
        transforms.RandomInvert()
    ]), p=0.5),
    transforms.ToTensor()
    ]
)
```
Another small change I made was adding in a weight decay in the optimizer of 1e-5 to help keep the weights in the network small. Using the listed data augmentations and weight decay, I was able to get better results(test accuracy) such as 82.61% Top-1 Accuracy which is an approximately 5.5% gain over no data augmentations.

## Results of Training SOTA Models
I trained each of the SOTA until the training accuracy levelled off then evaluated the model on the test set. After training I saw that Resnet34 was able to achieve the best performance and found that the Resnet34 seems to be the best as well in terms of performance/number of parameters tradeoff. I plotted each models test accuracy as a function of the number of parameters.
### Per Model Performance as a Function of Test Accuracy
![Per Model Performance](/assets/per_model_performance.png)
This plot allows us to pick a model based on the desired application where most likely for edge devices with larger memory or cloud based applications where you can have a nvidia gpu in a server, Resnet34 or Resnet18 will be the best option, but for edge devices we can see that mobilenetv2 has great accuracy for the number of parameters in the model.
### Per Class Performance for Each Model
![Per Class Performance](/assets/per_class_performance.png)
Next I digged into per class performance to get further insights of the model. Again here we just see on average the Resnet34 accuracy is the best. Further investigation would be needed, but an interesting finding is the dog and cat classes are lower than the rest which is intuitive since dogs and cats have similar body shapes and the model would need to be able to learn the features to distinguish them.

## Next Steps
Many leaderboards for SOTA models for the CIFAR10 dataset have higher accuracies, but in many cases the researchers used many GPU days worth of training. Using state of the art data augmentation techniques such as [Mixup](https://arxiv.org/pdf/1710.09412.pdf), utilizing many gpus in parallel with large amounts of memory for huge batch sizes, and training for a long time and slowly lowering the learning rate as training accuracy plateaus they were able to get better test performance. The next steps for me will be implementing the Mixup data augmentation and looking into training longer and smarter using techniques such as hard negative/sample mining where we focus on showing the model more hard samples and not wasting iterations on easy samples. The main goal of this experiment was using very standard models and data augmentations what is the best model and how do the performance of the models differ.