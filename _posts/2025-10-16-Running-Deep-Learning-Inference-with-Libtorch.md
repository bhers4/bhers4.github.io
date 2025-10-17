---
layout: post
title:  "Run Deep Learning Model Inference in C++ using Libtorch"
date:   2025-10-16 12:00:00 -0000
categories: c++ deep-learning python
tags: c++ deep-learning python
---
## Introduction
Support for training deep learning models and implementing inference pipelines is
mostly straightforward in Python and has lots of support and tutorials and packages,
yet a lot of production systems run using C++ so there is a need to convert your inference
code into C++. [Pytorch](https://pytorch.org/) is one of the main two deep learning packages
we will be talking about in this article, and they have a C++ library called Libtorch.
Libtorch offers significant performance advantages over Python-based inference, including reduced
overhead from the Python interpreter, more efficient memory management, and better integration with
existing C++ codebases for production systems. Running inference in C++ can result in 2-5x faster
inference times compared to Python, particularly for smaller batch sizes where Python's overhead
becomes more noticeable. Additionally, deploying models with Libtorch eliminates Python runtime 
dependencies, making it easier to integrate deep learning capabilities into embedded systems,
mobile applications, and high-performance computing environments. In this article, I will show you
how to setup Libtorch using CMake and run a simple inference script.

## Downloading Libtorch and Cuda
To get Libtorch to be able to run on your GPU, you need to download Libtorch off
the Pytorch website. As seen below I downloaded Libtorch corresponding to Pytorch 2.5.1
with Cuda 12.4. Download Libtorch from the website or use `wget` to download it. Once
you unzip the zip file it will be extracted to a folder called `libtorch`, note where
it is for later for CMake.
``` bash
wget https://download.pytorch.org/libtorch/cu124/libtorch-shared-with-deps-2.5.1%2Bcu124.zip
unzip libtorch-shared-with-deps-2.5.1%2Bcu124.zip
```
You need to ensure that you also have downloaded the corresponding version of cuda
onto your computer. In my case, I have a different version of cuda for other projects
so you need to download the proper runfile from Nvidia and then if you have another
version of cuda installed on your PC, uncheck everything except for the `cuda_toolkit`.
``` bash
wget https://developer.download.nvidia.com/compute/cuda/12.4.0/local_installers/cuda_12.4.0_550.54.14_linux.run
sudo sh cuda_12.4.0_550.54.14_linux.run
```

## Setup CMake
The next step is to setup a `CMakeLists.txt` file for your project. To start setup
your project by specifying the CMake version (I used 3.10). You may need to explicitly
set the path to the cuda version on your system if you have multiple versions of cuda
as seen below. You can also specify the version of gcc/g++ you want to run as well.
``` bash
cmake_minimum_required(VERSION 3.10)

project(pytorch_inference)

# Set compatible C++ compiler for CUDA
set(CMAKE_C_COMPILER /usr/bin/gcc-9)
set(CMAKE_CXX_COMPILER /usr/bin/g++-9)
set(CMAKE_CUDA_HOST_COMPILER /usr/bin/g++-9)

# Force CMake to use CUDA 12.4
set(CUDA_TOOLKIT_ROOT_DIR /usr/local/cuda-12.4)
set(CMAKE_CUDA_COMPILER /usr/local/cuda-12.4/bin/nvcc)
set(CUDAToolkit_ROOT /usr/local/cuda-12.4)
```

The next step is to tell CMake where Libtorch is, specifically the `libtorch/share/cmake/Torch`
directory to get it compile. I also added in gflags so when we make the C++ inference script
we can easily pass in flags like the path to the model. If you don't have gflags on your system
you can download it with:

``` bash
sudo apt-get install libgflags-dev
```
Now we can add the following to our CMakeLists.txt.
``` bash
# Add the path to the libtorch library
set(CMAKE_PREFIX_PATH "<path to where you downloaded libtorch>/libtorch/share/cmake/Torch")
# Find the Torch package
find_package(Torch REQUIRED)
find_package(gflags REQUIRED)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${TORCH_CXX_FLAGS}")
```
The final step for the CMake setup is to tell it the name of your C++ inference script which
in my case I named `inference.cc` and setup the libraries to link in. I also set the C++
version to C++17.

``` bash
# Add the executable
add_executable(pytorch_inference inference.cc)

set_property(TARGET pytorch_inference PROPERTY CXX_STANDARD 17)

target_link_libraries(pytorch_inference "${TORCH_LIBRARIES}" gflags)

list(APPEND CMAKE_PREFIX_PATH "libtorch")
```

## C++ Inference Script Setup
The first step is to setup the headers to libtorch and gflags. We can see below we
define the `model` flag which passes in the path to model we want to load into the inference
script. We setup gflags and make sure the `model` flag was passed in with the example
`./pytorch_inference --model /path/to/model/xyz.pt`.

``` c++
#include <iostream>
#include <torch/torch.h>
#include <torch/script.h>
#include <gflags/gflags.h>

DEFINE_string(model, "", "Path to the TorchScript model file");

int main(int argc, char* argv[]) {
  // Parse command-line flags
  gflags::SetUsageMessage("PyTorch C++ Inference\nUsage: ./pytorch_inference --model <path>");
  gflags::ParseCommandLineFlags(&argc, &argv, true);

  if (FLAGS_model.empty()) {
    std::cerr << "Error: --model flag is required" << std::endl;
    gflags::ShowUsageWithFlags(argv[0]);
    return 1;
  }
```
The next step is a simple check I added in to make sure the GPU is available and usable.
We check if the GPU is visible with `torch::cuda::is_available()` and set the device
accordingly.
``` c++
// Check if CUDA is available
torch::Device device(torch::kCPU);
if (torch::cuda::is_available()) {
  std::cout << "CUDA is available! Training on GPU." << std::endl;
  device = torch::Device(torch::kCUDA);
  // Create simple eye tensor on GPU
  torch::Tensor tensor = torch::eye(3).to(torch::kCUDA);
  std::cout << tensor << std::endl;
} else {
  std::cout << "CUDA is not available. Training on CPU." << std::endl;
  torch::Tensor tensor = torch::eye(3);
  std::cout << tensor << std::endl;
}
```
If the GPU is available at this point you should see a print out similar to the following:
``` bash
CUDA is available! Training on GPU.
 1  0  0
 0  1  0
 0  0  1
[ CUDAFloatType{3,3} ]
```

## Running Inference
Now you can try to load a trained model and perform the forward pass. In my case I had a sample YOLO object detection model
that I had trained. You need to make sure the model you loaded has been traced using [Pytorch's torchscript just-in-time compilation](https://docs.pytorch.org/docs/stable/generated/torch.jit.trace.html).
If you are using an open source package
they may have already implemented exporting to Torchscript, just look for Torchscript in the documentation. So in my case
I created a dummy tensor in the shape of a 640x640 image to pass through the model.
``` c++
  // Load the model
  torch::jit::script::Module model;
  try {
    model = torch::jit::load(FLAGS_model);
    model.to(device);
    model.eval();
    std::cout << "Model loaded successfully from: " << FLAGS_model << std::endl;
  } catch (const c10::Error& e) {
    std::cerr << "Error loading the model: " << e.what() << std::endl;
    return 1;
  }

  // Create random tensor with shape (1, 3, 640, 640) - typical image format
  torch::Tensor input = torch::rand({1, 3, 640, 640}).to(device);
  std::cout << "Input tensor shape: " << input.sizes() << std::endl;

  // Perform inference
  try {
    std::vector<torch::jit::IValue> inputs;
    inputs.push_back(input);
    torch::Tensor output = model.forward(inputs).toTensor();
    std::cout << "Inference successful!" << std::endl;
    std::cout << "Output tensor shape: " << output.sizes() << std::endl;
  } catch (const c10::Error& e) {
    std::cerr << "Error during inference: " << e.what() << std::endl;
    return 1;
  }

  return 0;
}
```
This should give an output similar to below:
``` bash
Model loaded successfully from: .../weights/last.torchscript
Input tensor shape: [1, 3, 640, 640]
Inference successful!
Output tensor shape: [1, 7, 8400]
```

The output shows that our YOLO model successfully processed the input tensor and confirms that the TorchScript model was loaded from disk and moved to the GPU. You can extend this basic inference script to process actual images by loading them using OpenCV or other image libraries, preprocessing them to match your model's expected input format, and post-processing the output tensors to extract meaningful detections with non-maximum suppression (NMS).
## Build Process and Project Structure
Now that we have setup the CMake configuration and written our C++ inference script, let's walk through
how to build and run the project. Your project directory structure should be organized as follows:

``` bash
project/
├── CMakeLists.txt      # CMake configuration file we created earlier
├── inference.cc        # C++ inference script with main function
└── build/              # Build directory (create this for out-of-source builds)
```

It's important to keep your build files separate from your source code by using an out-of-source build approach.
This keeps your project clean and makes it easier to rebuild from scratch if needed.

To build and run the project, follow these steps:

1. **Create the build directory**: Navigate to your project root and create a `build` directory where all
  compilation artifacts will be stored.
  ``` bash
  mkdir build
  cd build
  ```

2. **Configure the project**: Run CMake to configure the project and generate the build files. This step will
  locate all dependencies including Libtorch, CUDA, and gflags.
  ``` bash
  cmake ..
  ```
  
3. **Compile the project**: Build the executable using CMake's build command. This will compile `inference.cc`
  and link all necessary libraries.
  ``` bash
  cmake --build .
  ```
  
4. **Run the inference script**: Execute the compiled binary with the path to your TorchScript model. Make sure
  your model has been properly exported to TorchScript format (`.pt` file).
  ``` bash
  ./pytorch_inference --model /path/to/your/model.torchscript
  ```

If you need to rebuild the project after making changes to your source code, you can simply run `cmake --build .`
again from within the build directory. If you make changes to the CMakeLists.txt file or want to start fresh,
you can delete the build directory and repeat the process from step 1.

**Note**: Make sure the path to your TorchScript model is correct and that the model file has been properly
traced and exported from Python before attempting to load it in C++.

## Conclusion
In this tutorial, we've covered the complete process of setting up and running deep learning inference in
C++ using Libtorch. We started by downloading the appropriate Libtorch libraries and CUDA toolkit, then 
configured CMake to properly link all dependencies. We created a simple C++ inference script that 
demonstrates how to load a TorchScript model, check for GPU availability, and perform forward passes on 
input tensors.

The key takeaways from this tutorial are:

- **Performance Benefits**: Running inference in C++ with Libtorch eliminates Python overhead and can provide 2-5x faster inference times, making it ideal for production environments
- **CMake Configuration**: Proper setup of CMakeLists.txt is crucial for managing dependencies like Libtorch, CUDA, and gflags
- **Model Conversion**: Your PyTorch models must be converted to TorchScript format using `torch.jit.trace()` before they can be loaded in C++
- **GPU Support**: Libtorch seamlessly supports CUDA, allowing you to leverage GPU acceleration in your C++ applications
- **Production Ready**: The C++ inference pipeline is suitable for embedded systems, mobile applications, and high-performance computing environments where Python dependencies are undesirable

This setup provides a solid foundation for integrating deep learning models into production C++ codebases. The combination of PyTorch's flexibility during model development and Libtorch's performance during deployment offers a powerful workflow for deep learning projects.

### Common Errors and Troubleshooting
#### You forgot to convert your .pt model to torchscript
``` bash
Error loading the model: PytorchStreamReader failed locating file constants.pkl: file not found
Exception raised from valid at ../caffe2/serialize/inline_container.cc:236 (most recent call first):
frame 0: c10::Error::Error(c10::SourceLocation, std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> >) + 0xb0 (0x791584a03950 in /libtorch-cu12/lib/libc10.so)
```