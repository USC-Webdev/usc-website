# Posting guide for editors

This guide is for CMN editors who post to the USC website. You do everything in the browser; you never need to install anything.

## Before your first post

1. **Get a GitHub account** if you do not have one: https://github.com/signup
2. **Hide your email address.** In GitHub, open Settings → Emails and turn on both **Keep my email addresses private** and **Block command line pushes that expose my email**. The website's code is public, and every change you save carries your GitHub email unless you hide it.
3. **Ask the webdev team for access.** Send them your GitHub username. You will get an email invitation to the `USC-Webdev/usc-website` repository; accept it.

## 1. Log in

1. Go to **https://www.unitedspaceconfederation.org/keystatic** (until launch: https://usc-website-nine.vercel.app/keystatic).
2. Click **Log in with GitHub** and approve the request the first time.

## 2. Create a branch

Changes never go straight to the live site. You work on your own copy, called a branch, and the webdev team publishes it.

1. Click the branch name at the top left (it says `main`).
2. Choose **New branch**.
3. Give it a short name that says what you are doing, for example `newsletter-q4-2956`. Keystatic adds `content/` in front of it.

If you forget and try to save on `main`, Keystatic stops you and asks you to create a branch. That is expected.

## 3. Post a newsletter

1. In the left menu, open **Newsletters** and click **Add**.
2. Fill in:
   - **Title**: `Newsletter Q4 2956` (this exact pattern).
   - **URL slug**: `newsletter-q4-2956` (lowercase, dashes). This becomes the page address.
   - **Quarter**, **Year (in-universe)**, **Published date**.
   - **One-line summary**: shown on the Media Network page.
   - **Hero image**, **Alt text**, **Image credit** and credit status (see section 4).
   - **Intro**: the masthead line, for example "News from around the Confederation".
3. Under **Sections**, click **Add** for each part of the newsletter ("Profiles in Courage", "Senate Votes" and so on):
   - **Heading** is required.
   - **Kicker** is a small line above the heading, such as "Desk of the Consul of War". Optional.
   - **Body**: write normally. Use the toolbar for bold, italics, lists and links. Headings inside a section are Heading 3 or Heading 4.
   - **Gallery**: click **Add** for each image.
4. Drag sections to reorder them.
5. **Published on the site** is ticked by default. Untick it while the issue is unfinished: a draft is saved but appears nowhere on the site. Tick it again when the issue is ready.
6. Click **Create** (or **Save** when editing).

The newest published newsletter appears on the Media Network page automatically, the previous one moves under **Back issues**, and the menu lists every published issue.

### Publishing straight to the live site (USC-Webdev account)

Signed in to Keystatic as **USC-Webdev**, you skip the branch step: stay on `main`, add the issue as above with **Published on the site** ticked, and click **Create**. The site rebuilds and the issue is live in about two minutes. Editors' saves always go to a branch that USC-Webdev approves and merges (see sections 6 and 7); that is what puts their work live.

## 4. Images

- Export screenshots as **JPEG, at most 2560 pixels wide**. Files over 1.5 MB or wider than 3840 pixels fail the website's checks and block publishing.
- **Alt text** is optional but please add it: it is what people using screen readers hear. Describe what the image shows, for example "Three USC fighters escorting an Idris over Nyx". Do not start with "Image of". Leave it empty only for purely decorative images.
- **Image credit**: just the citizen's name, for example `Hadwin`. The site shows it as "In game image by USC-Citizen: Hadwin". Leave it empty for images that are not in-game screenshots.

## 5. Other things you can edit

| In the left menu | What it changes |
|---|---|
| Latest updates | Short posts in the **Latest Updates** carousel on Home. Give each a title and an in-universe **Date**. Paste a **Link** to an Instagram or X post, a YouTube video, a Discord event or any page: without an **Image**, the card uses the linked page's own picture, and without **Short text**, its description. The carousel always opens with the newest newsletter and ends with a **More at Media Network** card; between them come these posts, new videos and new posts from the channels and feeds in Site settings, newest first. The site checks for new videos and posts once a day. |
| Screenshot pool | Screenshots for the **USC in the 'Verse** carousel on the Media Network page. Each visit shows 10 of them picked at random (the number is set on the Media Network page in Keystatic). Click **Add**, upload the screenshot (same size rules as section 4), add a **Caption**, the **Image credit** and, if you like, a **Link** such as the newsletter it appeared in. Untick **In the pool** to take one out without deleting it. |
| News updates | The rows under "1.0 Notable News Updates" on the Media Network page. Untick **Visible** to hide one. Lower **Order** numbers come first. |
| Videos | Videos of the Month. The two with the newest **Month** are shown. Paste the YouTube ID (the part after `v=`). |
| Media Network page, The Citizen Compass page | Text on those pages. |
| Pages | Home, Our Vision, Leadership, Policies, Citizenship, Ministries. |
| Pages → Organization chart (interactive) | The org chart on the Ministries page: who holds each post, which offices are open, tiers and descriptions. Change a holder or set an office to Open here when people move. |
| Settings → Site settings | Application form link, contact email, social links, footer affiliates, the YouTube channels and RSS feeds (HangarWorks patch notes, The Citizen Compass) that fill Latest Updates, and how many items it shows. Ask the webdev team first. |

## Copy rules

- Facts first. A dry aside is fine after the fact, never instead of it.
- No jokes about donations, payment, policy, conduct or reports to the Consul of Peace.
- Wherever donations come up, include: "Membership never requires payment. Donations are voluntary and confidential. Anyone asking for donations on the USC's behalf should be reported to the Consul of Peace."
- Dates are `DD.MM.YYYY` in the in-universe year. Issues are "Newsletter Q3 2956".
- Full name once ("United Space Confederation", "Confederation Media Network"), then "the USC" and "the CMN". Members are citizens.

## 6. Open a pull request

When your branch is ready:

1. Click the branch name at the top left.
2. Choose **Create pull request**. GitHub opens in a new tab.
3. Write one line about what changed and click **Create pull request**.
4. Tell the webdev team in Discord that it is waiting.

You can keep editing the same branch after opening the pull request; the pull request updates by itself.

## 7. What happens next

1. The website's checks run on your pull request (a few minutes). A red cross usually means an image is too large; the details name the file.
2. A preview of the site with your changes is built. The pull request shows a **Vercel** link; open it to check your work.
3. The webdev team reviews it and merges it with **Create a merge commit**.
4. The live site updates about two minutes after the merge.

## If something goes wrong

- **"Restored draft" appears and an image field is empty**: Keystatic keeps unsaved work in your browser. Use the reset icon at the top of the entry to discard the draft, then reload.
- **You cannot see the repository**: you have not accepted the GitHub invitation yet. Check your email.
- **Anything else**: ask the webdev team, and include the page address and a screenshot.
