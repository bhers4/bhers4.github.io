---
layout: post
title:  "Running Object Detection on a Raspberry Pi"
date:   2024-11-07 12:00:00 -0000
categories: object-detection deep-learning raspberry-pi
tags: python object detection deep learning raspberry-pi
---
## Introduction
In the previous blog post, we talked about how to do simple object detection using
the Ultralytics program. In this blog post, we will cover how to deploy an object
detection model to a Raspberry Pi. We will discuss how to capture and pass images
to the model using the PiCamera2 package, create a virtual environment, and install
the required Python packages. We will also demonstrate how to run the object detection
model on both a Raspberry Pi 3B+ and a Raspberry Pi 5 8GB, comparing their performance
and feasibility for real-time applications. By the end of this post, you will have a
clear understanding of how to set up and run object detection on a Raspberry Pi, and
the advantages of using newer hardware for such tasks.

## Checking the Camera
The first step is to ensure that the camera is properly connected to the Raspberry Pi. For this tutorial, I used a Raspberry Pi Camera V2 plugged into a Raspberry Pi 3B+. Follow these steps to check the camera connection:

1. **Power off the Raspberry Pi**: Before connecting the camera, make sure the Raspberry Pi is powered off to avoid any electrical damage.
2. **Connect the camera**: Insert the camera ribbon cable into the camera port on the Raspberry Pi. Ensure that the cable is inserted correctly with the metal connectors facing the correct direction.
3. **Secure the connection**: Gently push the connector clip back into place to secure the ribbon cable.

Once the camera is connected, power on the Raspberry Pi and run the following commands to check if the camera is detected and working properly:
``` shell
libcamera-hello
rpicam-hello
```

## Create a Virtual Environment and Import Required Python Packages
Creating a virtual environment is a good practice to manage dependencies and avoid conflicts between different projects. Follow these steps to create and activate a virtual environment, and then install the required Python packages:

1. **Create a virtual environment**: Use the following command to create a new virtual environment. Replace `/path/to/new/virtual/environment` with your desired path.
    ```shell
    python -m venv /path/to/new/virtual/environment
    ```

2. **Activate the virtual environment**: Once the virtual environment is created, activate it using the following command. This command may vary depending on your operating system:
    - On Linux or macOS:
        ```shell
        source /path/to/new/virtual/environment/bin/activate
        ```

3. **Upgrade pip**: It's a good idea to upgrade pip to the latest version before installing any packages:
    ```shell
    pip install --upgrade pip
    ```

4. **Install required Python packages**: Use the following command to install the necessary packages for this tutorial. These packages include `numpy` for numerical operations, `opencv-python` for image processing, and `ultralytics` for the YOLO model.
    ```shell
    pip install numpy opencv-python ultralytics
    ```

By following these steps, you will have a clean and isolated environment with all the required dependencies installed. This setup ensures that your project remains organized and avoids potential conflicts with other Python projects on your system.

If you need to deactivate the virtual environment at any point, simply run:
```shell
deactivate
```

## Acquiring Images
To acquire images from your camera plugged into the Raspberry Pi, we are going
to use the PiCamera2 library. This library provides a convenient interface for
capturing images and videos from the camera. We start by importing the necessary
packages that we will use later on.
``` python
import cv2
import numpy as np
from picamera2 import Picamera2
import time
from ultralytics import YOLO
```
We create a camera object using the Picamera2 library which connects and
interfaces with the camera. We also will create a Ultralytics YOLO object
detection object.
``` python
camera = Picamera2()
model = YOLO("yolo11n.pt")
```
To capture high-resolution still images, we need to set up the camera configuration.
The "lores" part refers to the low-resolution image that can be displayed while
processing the high-resolution image. We create the still configuration, 
configure the camera with it, and then start the camera.
``` python
still_config = camera.create_still_configuration(main={"size": (1920, 1080)}, lores={"size": (640,480)}, display='lores')
camera.configure(still_config)
camera.start()
```
To capture an image, the camera object has a very convenient utility called
capture_array.
``` python
array = camera.capture_array("main")
```
This array can then be passed to the object detection model for processing.
The PiCamera2 library makes it easy to capture images and integrate them into
your object detection pipeline. By following these steps, you can efficiently
acquire images from your Raspberry Pi camera and prepare them for object detection.

## Run the Object Detection Model
With the image captured and stored in an array, we can now run the object detection model.
The Ultralytics YOLO model provides a straightforward interface for performing object detection.
Use the following code to run the model on the captured image:
``` python
results = model(array, verbose=True)
```
If you want to display the results on the image you can look at this [Previous Blog Post](/object-detection/deep-learning/2024/11/06/running-object-detection.html)
### Running YOLO Models on a Raspberry Pi 3B+
The next step we took was to run this on a Raspberry Pi 3B+ to see the inference
time of different models and evaluate the feasibility of running these models in a
real system.

| Model | Time (Seconds Per Frame) |
| ----- | ----------------------- |
| YOLO11n | 2.5 |
| YOLO11s | 10 |

Through these experiments, we found that using a Raspberry Pi 3B+ was most likely
not feasible for any near real-time applications, especially if combined with
other sensors such as in a dashcam application. The older hardware of the Raspberry Pi 3B+,
with its limited processing power and RAM, significantly impacts the performance
of object detection models, resulting in slower inference times.

The limitations of the Raspberry Pi 3B+ restrict its use to applications where
real-time processing is not critical. For example, it could be used in scenarios
where images can be processed offline or where the detection speed is not a primary
concern. However, for applications requiring quick and efficient processing, such
as live surveillance or interactive robotics, the Raspberry Pi 3B+ falls short.

Overall, while the Raspberry Pi 3B+ can still be used for basic object detection tasks,
its older hardware limits its application to less demanding areas.

### Running YOLO Models on a Raspberry Pi 5 8GB
Since we also had a Raspberry Pi 5, we wanted to test the inference speeds on
a newer Raspberry Pi with more RAM and a faster processor.

| Model | Time (Seconds Per Frame) |
| ----- | ----------------------- |
| YOLO11n | 0.43 |
| YOLO11s | 0.9 |

We found that the Raspberry Pi 5 was able to run the nano (smallest model) in
430ms and the small model in 900ms. This performance allows for the acquisition
and processing of 1-2 high-resolution images per second, making it feasible for
a wider range of real-time applications such as surveillance, robotics, and
automated inspection systems.

The significant improvement in inference time on the Raspberry Pi 5 compared to
the Raspberry Pi 3B+ demonstrates the advantage of using more recent hardware
for computationally intensive tasks like object detection. The additional RAM
and processing power of the Raspberry Pi 5 enable it to handle more complex
models and larger images more efficiently.

Overall, the Raspberry Pi 5 provides a viable platform for deploying YOLO models
in real-time applications, offering a balance between performance and cost.

## Conclusion
In this blog post, we show how to run an Ultralytics YOLO model on a Raspberry Pi. We
timed the inference of the nano and small size Ultralytics YOLO model on both an
older Raspberry Pi 3B+ and a newer Raspberry Pi 5 8GB. We found that the older
Raspberry Pi was over 10x slower then the newer model and that the Raspberry Pi
5 could acquire and run object detection models at 1-2 Hz allowing a greater 
variety of applications.
