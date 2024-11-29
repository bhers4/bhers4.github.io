---
layout: post
title:  "Scrap and Summarize the News using LLMs"
date:   2024-11-07 12:00:00 -0000
categories: llm deep-learning
tags: python llm deep-learning
---
## Introduction
As the prevalence of Large Language Models (LLMs) increases, we wanted to experiment with using these powerful tools in practical applications. One simple yet effective experiment we devised was to use Python to scrape news articles and then employ an LLM to summarize the content. For this task, we chose to use the Python packages Selenium and BeautifulSoup4 to handle web scraping. Additionally, we utilized [Ollama](https://ollama.com/) to download the model and run it locally. To execute the model, we leveraged the LangChain Python package. Please note that this is just an exercise, and you should always adhere to websites' scraping policies when performing similar tasks.

### Installation
First, we need to install the necessary Python packages. You can do this using pip:
``` shell
pip install beautifulsoup4 selenium langchain
```

### Setup the Webdriver in Python
Next, we need to set up the Selenium WebDriver to interact with the web browser. Here is how you can configure it:
``` python
options = webdriver.ChromeOptions()
options.add_argument('--ignore-certificate-errors')
options.add_argument('--incognito')
driver = webdriver.Chrome()
```
### Pull and Create the Model
For our experiment, we used the Llama3.2-vision:11b model. You can pull the model using the following command:
``` shell
ollama pull llama3.2-vision:11b
```
Once the model is downloaded locally, we can set it up using LangChain in Python:
``` python
from langchain_ollama import OllamaLLM
model = OllamaLLM(model="llama3.2-vision:11b")
```
### Get the HTML and Page Source
For our dummy case, we chose the Yahoo Finance Canada site. We start by directing the driver to the URL, which loads the Chrome browser and opens the web page. We then retrieve the HTML content from the driver through the page_source attribute and pass it to BeautifulSoup for parsing.
``` python
url_test = "https://ca.finance.yahoo.com/"
driver.get(url_test)
html = driver.page_source
# Parse the HTML with BeautifulSoup
soup = BeautifulSoup(html, 'html.parser')
```
### Get Story and Summarize it
To extract a news story, we repeat the above procedure to get the HTML for the specific news article. We then find all the paragraph ("p") elements on the page and concatenate their text content to build the full story as a string. Finally, we pass this text to the local LLM using the invoke method to get a summary.
``` python
story_data = soup.find('div', class_=re.compile(r"body"))
paragraphs = [p_tag.get_text() for p_tag in story_data.find_all("p")]
full_story = ""
for data in paragraphs:
    full_story += data + "\n"
# Get AI summarization
result = model.invoke("can you summarize the following news story: " + full_story)
```
Now, the result variable contains an AI-generated summary of the news article we scraped from the internet.
### Conclusion
In this post, we demonstrated how to use Python and LLMs to scrape and summarize news articles. By leveraging tools like Selenium, BeautifulSoup4, and LangChain, we can automate the process of extracting and summarizing web content. This experiment showcases the practical applications of LLMs and their potential to streamline information processing tasks. 