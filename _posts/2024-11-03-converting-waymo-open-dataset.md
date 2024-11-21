---
layout: post
title:  "Converting Waymo Open Dataset Object Detection Parquet Data to COCO-Style Format"
date:   2024-11-03 12:00:00 -0000
categories: object-detection deep-learning
tags: python object detection deep learning
---
## Introduction

The Waymo Open Dataset is a popular dataset for autonomous driving research. It contains a large amount of data collected from Waymo's self-driving cars, including images, point clouds, and annotations. 
I wanted to use the Waymo Open Dataset to learn about object detection because it offers a large amount of high-quality data collected from Waymo's self-driving cars, making it an excellent resource for training and evaluating object detection models. However, the dataset is provided using [Apache Parquet files](https://parquet.apache.org/) but many open source packages expect data in the [COCO-style format](https://cocodataset.org/#home). The Waymo Open Dataset's migration to using Apache Parquet files is recent (called v2) so I found that their [tutorial for v2](https://github.com/waymo-research/waymo-open-dataset/blob/master/tutorial/tutorial_v2.ipynb) didn't show how to extract useful box and image data from the parquet files. In this blog post, we will walk through the process of converting the Waymo Open Dataset object detection data from Parquet format to the more common COCO-style format to allow users to easily train object detection models using open source packages.

## Prerequisites

Before we start, make sure you have the following installed:

- Python 3.10 or higher
- Waymo Open Dataset tools
- Pandas
- NumPy
- Dask

You can install the necessary packages using pip:

```sh
pip install waymo-open-dataset-tf-2-11-0
pip install pandas
pip install numpy
pip install dask
```

## Step 1: Download the Waymo Open Dataset
The first step is to using your Google Account sign into the Waymo Open Dataset
website and download the data. If you are downloading multiple files you might
need to use their Google Cloud CLI called [gsutils](https://cloud.google.com/storage/docs/gsutil_install#deb).
This allows you to download entire directories onto your PC.

## Step 2: Finding all Image and Box Parquet Files
Since the dataset is structured that the box labels and images are stored in 
separate folders, the first step is to find all the parquet files in each of the
folders. Waymo uses tensorflow tools in their repository to find the parquet files.
The dataset also uses [Dask](https://www.dask.org/) to read the dataframes as it allows you to
handle both the large size and large number of files.
``` python
import dask.dataframe as dd
import tensorflow as tf
from waymo_open_dataset import v2

def read(dataset_dir: str, tag: str, context: str) -> dd.DataFrame:
  """Creates a Dask DataFrame for the component specified by its tag."""
  paths = tf.io.gfile.glob(f'{dataset_dir}/{tag}/{context}.parquet')
  return dd.read_parquet(paths)

def get_context_names(path: str, tag: str) -> list:
    """
    Goes through a directory and finds all parquet files and lists the file names.

    Parameters:
    path (str): The directory path to search for parquet files.
    tag (str): The tag to filter the parquet files.

    Returns:
    list: A list of file names with the specified tag.
    """
    return [os.path.basename(f) for f in \
            tf.io.gfile.glob(f'{path}/{tag}/*.parquet')]
```
Next we can in a function get all the image and bounding box file names and return
only the file names which have both images and boxes since depending on how much
of the dataset you downloaded you might only have image or box data for certain
parquets.
``` python
def get_images_and_boxes(path: str) -> List:
    camera_images = get_context_names(path, 'camera_image')
    camera_bbox = get_context_names(path, 'camera_box')
    # Uses List comprehensions to go through and find elements that only exists
    # in both lists.
    camera_data = [a for a in camera_images if a in camera_bbox]
    return camera_data
```

## Step 3: Read Parquet Data into Camera and Box Objects
Once we have the names of the files with both camera and bounding box data we can
open the parquet files and read the data into Waymo Open Dataset objects.

First the camera box objects have a center and size object but to prepare them
for the COCO-style format we transform them to a list using the following function:
``` python
def box_obj_to_list(box_obj: v2.CameraBoxComponent):
    box = box_obj.box
    centers = box.center
    sizes = box.size
    num_boxes = len(centers.x)
    boxes = []
    for i in range(num_boxes):
        boxes.append([centers.x[i], centers.y[i], sizes.x[i], sizes.y[i]])
    return boxes
```
Now we can get the image as a np array and the boxes as a list of lists. Another
important member of the box object is the types member which contains a list of
integers the same length as the number of boxes containing the class id for each
box.
``` python
camera_data = get_images_and_boxes(path)
for camera_id in camera_data:
    camera_id = camera_id.strip(".parquet")
    cam_image_df = read(path, 'camera_image', camera_id)
    cam_box_df = read(path, 'camera_box', camera_id)
    # Merges the images and boxes into 1 dataframe
    image_w_box_df = v2.merge(cam_image_df, cam_box_df, right_group=True)
    for i, (_, r) in enumerate(image_w_box_df.iterrows()):
        cam_image = v2.CameraImageComponent.from_dict(r)
        cam_box = v2.CameraBoxComponent.from_dict(r)
        # Use tensorflow to decode the image and then cast as a np array
        img = tf.image.decode_jpeg(cam_image.image).numpy()
        boxes = box_obj_to_list(cam_box)
        types = cam_box.type
``` 

## Step 4: Convert Boxes to COCO-style Format
COCO uses a normalized form of the box size and coordinates. Each row is expected
to be in center_x, center_y, width, and height format as noted in the function comment
below. This function takes in our previous list of lists and normalizes each box
based on the image size.
``` python
def normalize_boxes(img: np.ndarray, boxes: List) -> List:
    """
        COCO Format:
        COCO expects one *.txt file per image (if no objects in image,
        no *.txt file is required). The *.txt file specifications are:

        One row per object
        Each row is class x_center y_center width height format.
        Box coordinates must be in normalized xywh format (from 0 to 1). If your
        boxes are in pixels, divide x_center and width by image width, and
        y_center and height by image height.
        Class numbers are zero-indexed (start from 0).
    """
    shape_x = img.shape[1]
    shape_y = img.shape[0]
    norm_boxes = []
    for box in boxes:
        center_x, center_y, width, height = box        
        norm_boxes.append([center_x / shape_x, center_y / shape_y,
                           width / shape_x, height / shape_y])
    return norm_boxes
```

## Step 5: Write the Data
Now you have the images as np arrays and the normalized box data for each image,
so all that needs to get done is to write out the space-delimited box data into
txt files and save the np arrays to the proper directories which you can do using
packages such as PIL to save the images as png or jpeg files. The thing to remember
is the coco format is **space delimited** not comma delimited and you start
with the class id then normalized x, y, width, and finally height.

## Conclusion:
This allowed me to train an object detection model using open-source packages
such as [Ultralytics](https://www.ultralytics.com/) using a yml file as simple as:
``` yml
path: <waymo base path>/
train: training/
val: val/

names:
  0: car
  1: pedestrian
  2: cyclist
```
Where you save all the images in one directory named images/ and all the box files
in a folder called labels/. In a future blog post I will show how to train a simple 
model using a package such as Ultralytics.