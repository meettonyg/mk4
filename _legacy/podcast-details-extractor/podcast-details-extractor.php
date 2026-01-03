<?php
/**
 * Plugin Name: Podcast Details Extractor
 * Description: Extracts email address and podcast information from an Apple Podcast or Google Podcast URL.
 * Version: 1.0
 * Author: Tony Guarnaccia
 */

function apre_get_itunes_rss_url($apple_podcast_url) {
    preg_match('/id(\d+)/', $apple_podcast_url, $matches);
    if (!$matches) {
        return false;
    }

    $podcast_id = $matches[1];
    $api_url = 'https://itunes.apple.com/lookup?id=' . $podcast_id;
    $response = wp_remote_get($api_url);

    if (is_wp_error($response)) {
        return false;
    }

    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (isset($data['results'][0]['feedUrl'])) {
        return $data['results'][0]['feedUrl'];
    }

    return false;
}


function apre_get_google_podcast_rss_url($google_podcast_url) {
    preg_match('/aHR0c[^"]+/', $google_podcast_url, $matches);
    if ($matches) {
        return urldecode(base64_decode($matches[0]));
    }
    return false;
}

function apre_get_podcast_rss_url($url) {
    if (strpos($url, 'podcasts.apple.com') !== false) {
        return apre_get_itunes_rss_url($url);
    } elseif (strpos($url, 'podcasts.google.com') !== false) {
        return apre_get_google_podcast_rss_url($url);
    }
    return false;
}

function apre_get_podcast_info($rss_feed_url) {
    // Load the RSS feed XML
    $rss_feed_xml = simplexml_load_file($rss_feed_url);
    $namespaces = $rss_feed_xml->getNamespaces(true);

    // Extract the podcast information
    $channel = $rss_feed_xml->channel;
    $itunes = $channel->children($namespaces['itunes']);

    $podcast_info = array(
        'link' => (string)$channel->link,
        'language' => (string)$channel->language,
        'copyright' => (string)$channel->copyright,
        'webMaster' => (string)$channel->webMaster,
        'managingEditor' => (string)$channel->managingEditor,
        'image' => (string)$channel->image->url,
        'itunes_owner_name' => (string)$itunes->owner->name,
        'itunes_owner_email' => (string)$itunes->owner->email,
        'itunes_category' => (string)$itunes->category->attributes()->text,
        'itunes_keywords' => (string)$itunes->keywords,
        'itunes_explicit' => (string)$itunes->explicit,
        'itunes_image' => (string)$itunes->image->attributes()->href,
        'pubDate' => (string)$channel->pubDate,
        'title' => (string)$channel->title,
        'itunes_author' => (string)$itunes->author,
        'description' => (string)$channel->description,
        'itunes_summary' => (string)$itunes->summary,
        'itunes_subtitle' => (string)$itunes->subtitle,
        'lastBuildDate' => (string)$channel->lastBuildDate,
    );

    return $podcast_info;
}

function apre_podcast_url_form_shortcode() {
        if (!function_exists('apre_get_podcast_rss_url') || !function_exists('apre_get_podcast_info')) {
        return 'The Podcast Details Extractor plugin is not active. Please activate it.';
    }

    ob_start();
    ?>
    <form id="podcast-url-form">
        <label for="podcast-url">Podcast URL:</label>
        <input type="url" id="podcast-url" name="podcast-url" required>
        <button type="submit">Submit</button>
    </form>
    <div id="podcast-info"></div>
    <script>
        document.getElementById('podcast-url-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const podcastURL = document.getElementById('podcast-url').value;
            if (podcastURL) {
                const podcastInfo = await fetchPodcastInfo(podcastURL);
                displayPodcastInfo(podcastInfo);
            }
        });

        async function fetchPodcastInfo(url) {
            const response = await fetch(`/wp-json/podcast-details-extractor/v1/info?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            return data;
        }

function displayPodcastInfo(podcastInfo) {
  const podcastInfoDiv = document.getElementById('podcast-info');
  podcastInfoDiv.innerHTML = '';

  if (podcastInfo.error) {
    podcastInfoDiv.textContent = podcastInfo.error;
    return;
  }

  const layout = document.createElement('div');
  layout.style.display = 'flex';
  layout.style.alignItems = 'flex-start';
  layout.style.gap = '32px';
  podcastInfoDiv.appendChild(layout);

  const imageWrapper = document.createElement('div');
  imageWrapper.style.flex = '1 1 33%';
  layout.appendChild(imageWrapper);

  if (podcastInfo.image) {
    const image = document.createElement('img');
    image.src = podcastInfo.image;
    image.alt = `${podcastInfo.title} cover image`;
    image.style.maxWidth = '100%';
    image.style.height = 'auto';
    imageWrapper.appendChild(image);
  }

  const detailsWrapper = document.createElement('div');
  detailsWrapper.style.flex = '1 1 66%';
  layout.appendChild(detailsWrapper);

  const title = document.createElement('h2');
  title.textContent = podcastInfo.title;
  detailsWrapper.appendChild(title);

  if (podcastInfo.itunes_category) {
    const category = document.createElement('h4');
    category.textContent = `Category: ${podcastInfo.itunes_category}`;
    detailsWrapper.appendChild(category);
  }

  const description = document.createElement('p');
  description.textContent = podcastInfo.description;
  detailsWrapper.appendChild(description);

  // Add some basic styling
  podcastInfoDiv.style.fontSize = '16px';
  podcastInfoDiv.style.lineHeight = '1.5';
  title.style.marginBottom = '16px';
  title.style.fontWeight = 'bold';
  description.style.marginBottom = '16px';

  const otherDetailsList = document.createElement('dl');
  otherDetailsList.style.marginTop = '16px';
  const keys = Object.keys(podcastInfo);

  const order = [
    'lastBuildDate',
    'language',
    'itunes_explicit',
    'link',
    'itunes_owner_name',
    'itunes_owner_email',
    'itunes_author',
  ];

  order.forEach(key => {
    if (keys.includes(key)) {
      let term = key.replace('_', ' ');
      term = term.charAt(0).toUpperCase() + term.slice(1);

      if (key === 'itunes_owner_name') {
        term = 'Owner';
      } else if (key === 'itunes_owner_email') {
        term = 'Email';
      } else if (key === 'lastBuildDate') {
        term = 'Last Episode';
        podcastInfo[key] = new Date(podcastInfo[key]).toLocaleDateString();
      }

      const dt = document.createElement('dt');
      dt.textContent = term;
      dt.style.fontWeight = 'bold';
      dt.style.marginBottom = '8px';
      otherDetailsList.appendChild(dt);

      const dd = document.createElement('dd');
      dd.textContent = podcastInfo[key];
      dd.style.marginBottom = '16px';
      dd.style.marginLeft = '0';
      dd.style.textAlign = 'left';
      otherDetailsList.appendChild(dd);

      if (key === 'itunes_owner_email') {
		term = 'Email';
        const ownerEmail = podcastInfo[key];
        const ownerEmailDt = document.createElement('dt');
        ownerEmailDt.style.textAlign = 'left';
      }
    }
  });

  detailsWrapper.appendChild(otherDetailsList);
}

    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('apre_podcast_url_form', 'apre_podcast_url_form_shortcode');

function apre_register_rest_routes() {
    register_rest_route('podcast-details-extractor/v1', '/info', array(
        'methods' => 'GET',
        'callback' => 'apre_get_podcast_info_rest',
        'args' => array(
            'url' => array(
                'required' => true,
                'type' => 'string',
                'validate_callback' => function ($value, $request, $param) {
                    return filter_var($value, FILTER_VALIDATE_URL) !== false;
                },
            ),
        ),
    ));
}
add_action('rest_api_init', 'apre_register_rest_routes');

function apre_get_podcast_info_rest(WP_REST_Request $request) {
    $url = $request->get_param('url');
    $rss_feed_url = apre_get_podcast_rss_url($url);

    if (!$rss_feed_url) {
        return new WP_Error('invalid_url', 'Invalid podcast URL.', array('status' => 400));
    }

    $podcast_info = apre_get_podcast_info($rss_feed_url);
    return $podcast_info;
}

?>
