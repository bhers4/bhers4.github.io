---
layout: post
preview: "Running Jetson NX Off SSD"
title:  "Running Jetson NX Off SSD"
date:   2023-03-20 12:00:00 -0700
hide: true
categories: 
    - "hersoverflow"
tags: jetson nvidia embedded ssd nvme
---
I am creating a series I call "hersoverflow" as my own personal stackoverflow where when I hit issues
in my personal projects or work life I build up a series of how-to's to fix the errors.
### Related Errors to search by
``` shell
NTFS signature is missing.
Failed to mount '/dev/nvme0n1p1': Invalid argument
The device '/dev/nvme0n1p1' doesn't seem to have a valid NTFS.
Maybe the wrong device is used? Or the whole disk instead of a
partition (e.g. /dev/sda, not /dev/sda1)? Or the other way around?
```
AND
``` shell
mount: /mnt: wrong fs type, bad option, bad superblock on /dev/nvme0n1p1, missing codepage or helper program, or other error.
```
## Step by Step on Running NX off SSD and Fix Errors
The Nvidia Jetson Xavier Dev kit can be run off of a SD card for simpler tasks but I found in 
computer vision scenarios where we logging images into the SD card rapidly, the SD card IO can be a 
bottleneck for further systems. One can install a NVMe on the NX and run the ubuntu based OS off of 
the NVMe instead of the SD card to alleviate some of these issues. We are following 
[rootOnNVMe](https://github.com/jetsonhacks/rootOnNVMe) but I had to add in a few steps I thought I
would add here.
## Format and Create Partition on the NX
To start use the parted tool in ubuntu,
``` bash
    sudo parted /dev/nvme0n1
```
In parted do:
``` bash
    mklabel gpt
```
I was using a Samsung 500GB SSD so I entered in:
``` bash
    mkpart primary ext4 1MB 500GB
```
To see all the partitions use:
``` bash
    print
```
## Create EXT4 Filesystem
Now the big part that took me a little while to figure out is the parted and mkpart commands don't
actually create a ext4 filesystem so if we try and run the [rootOnNVMe](https://github.com/jetsonhacks/rootOnNVMe)
first script(where we try to mount the SSD to /mnt) we get either of the 2 errors above depending on
the mount command you run. To create the ext4 filesystem we run
``` bash
    sudo mkfs.ext4 /dev/nvme0n1p1
```
## Run rootOnNVMe Setup
Now we can run the [rootOnNVMe](https://github.com/jetsonhacks/rootOnNVMe) setup scripts, restart 
the NX and you will be running off SSD instead of SD card for any high bandwidth logging scenarios 
like in robotics or autonomous vehicles.