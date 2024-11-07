---
layout: post
title:  "Running Simple Object Detection using Ultralytics"
date:   2024-11-06 12:00:00 -0000
categories: object-detection deep-learning
tags: python object detection deep learning
---
## Introduction
Object detection is a crucial task in computer vision that involves identifying
and locating objects within an image. It is used in applications such as self-driving
cars to video surveillance to medical imaging. In this post, we will explore how to run
simple object detection using the Ultralytics Python package, which provides a
user-friendly interface for implementing state-of-the-art object detection
models.

## Prerequisites
Before we begin, ensure you have the following installed:
- Python 3.8 or higher
- pip (Python package installer)

You can install the Ultralytics package using pip:
```bash
pip install ultralytics opencv-python numpy pillow torch
```

## Setting Up
First, let's import the necessary libraries and load a pre-trained model:
```python
import cv2
import numpy as np
import os
from PIL import Image
import torch
from ultralytics import YOLO

# Load a model
model = YOLO("yolo11s.pt")  # pretrained YOLO11s model
```

## Running Object Detection
For my application, I was running object detection on a folder of png images
representing a video so the following snippet shows you how to load the images
and pass them into the model. I turned verbose off, but the verbose flag set to
True gives you written information on how long inference took and the number of each
object found.
```python
for root, dirs, files in os.walk(data_dir):
    files.sort()
    for file in files:
        if file.endswith(".png"):
            # Load image
            img = np.array(Image.open(os.path.join(root, file)))
            results = model(img, device=torch.device("cpu"), verbose=False)
```
## Displaying the Boxes
This gives a list of detections of which we can extract the boxes and plot them
on the images. The results consist of: boxes, class ids, object ids, and class
names. The box comes in different formats such as xywh or xyxy but we used their
xyxy format which gives you the four corners of the box.
``` python
img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
for result in results:
    boxes = result.boxes  # Boxes object for bounding box outputs
    masks = result.masks  # Masks object for segmentation masks outputs
    keypoints = result.keypoints  # Keypoints object for pose outputs
    probs = result.probs  # Probs object for classification outputs
    obb = result.obb  # Oriented boxes object for OBB outputs
    for box in boxes:
        conf = box.conf
        class_id = box.cls
        object_id = box.id
        class_name = model.names[int(class_id.item())]
        pt1 = (int(box.xyxy[0][0].item()), int(box.xyxy[0][1].item()))
        pt2 = (int(box.xyxy[0][2].item()), int(box.xyxy[0][3].item()))
        cv2.rectangle(img, pt1, pt2, (0, 0, 255), 2)
        cv2.putText(img, class_name, pt1, cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 0, 0), 1, cv2.LINE_AA)
```
And finally we can use opencv to display the images.
``` python
cv2.imshow("Img", img)
cv2.waitKey(10)
```
I used an example image from the BDD100K self driving dataset to generate the
following image.
![Per Model Performance](/assets/object_detection.png)

## Conclusion
In this post, we have walked through the steps to perform simple object
detection using the Ultralytics Python package. We started by setting up the
environment and installing the necessary dependencies. Then, we loaded a
pre-trained YOLO model and ran object detection on a series of images.
Finally, we displayed the detected objects with bounding boxes using OpenCV.

Object detection is a powerful tool in computer vision, and with the help of
user-friendly libraries like Ultralytics, it has become more accessible to
developers and researchers. We hope this guide has provided you with a clear 
understanding of how to implement object detection in your own projects.