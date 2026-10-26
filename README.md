# The-Economist-Audio-List
Download links for The Economist Audio Files


## Final Update — October 26, 2026

As of October 26, 2026, the public audio ZIP download method has stopped working. I will not make any further effort to restore or work around it, so this project has reached the end of active development.

Thank you to everyone who has used, supported, contributed to, or simply followed this project over the years.

### A little history

I started this project around 2021 with a very simple purpose: to make it easier for subscribers to retrieve and archive audio editions from The Economist's CDN.

At the time, the audio distribution was straightforward. For each weekly edition, the M4A, MP3, and ZIP files were publicly accessible without additional authorization, and the URL naming convention was predictable and easy to follow.

That remained workable for several years.

In December 2024, the old URL scheme stopped working after a new GraphQL layer was introduced to retrieve the unique edition tegId. At that time, the GraphQL gateway itself remained publicly accessible, so it was still possible to query the edition inventory and obtain the information needed to construct the audio URLs.

The situation changed again in August 2026. GraphQL gateway updated, general public access was removed and header-based authentication was introduced. However, once the edition teg was known, the underlying audio files themselves were still publicly accessible, so the project's original approach could continue to work.

In October 2026, access was tightened further. Downloading the audio files now also requires authorization headers.

Technically, it still be possible to continue down this path by reproducing the application's authenticated requests, including HMAC-based request signing and application-specific headers such as timestamps, client information, consumer identifiers, and trace IDs.

But that is where I am choosing to stop.

The original intention of this project was never to bypass access controls. It was simply a convenience tool for subscribers to retrieve the audio archive from The Economist's CDN when those files were publicly accessible.

Once continuing the project requires reproducing private authentication mechanisms or deliberately working around access restrictions, it crosses a line that I do not want this project to cross.

### Project status

As of October 26, 2026, the existing edition tegs and historical information may still be useful. The repository will therefore remain available **as-is**, but there will be no further updates, fixes, workarounds, or support for changes to The Economist's access-control mechanisms.

Please do not open issues requesting new authentication workarounds.

It has been over five years since this project began. What started as a small utility lasted much longer than I expected.

Thank you again to everyone who supported and used it.

**So long, and thanks for all the support.**




Website [https://jingking.github.io/The-Economist-Audio-List/economistdownload.html](https://jingking.github.io/The-Economist-Audio-List/economistdownload.html)

The CDN cache may stop working at any time.

The online player stopped working because m4a files were removed. There's an awesome podcast player from [Monkfishare](https://monkfishare.gitlab.io/econaudio/). A local variant can be found [here](https://jingking.github.io/The-Economist-Audio-List/player.html).

![screenshot](https://jingking.github.io/The-Economist-Audio-List/Find%20Edition.png)


