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
5. Click **Create** (or **Save** when editing).

The newest newsletter appears on the Media Network page automatically, and the menu lists every issue.

## 4. Images

- Export screenshots as **JPEG, at most 2560 pixels wide**. Files over 1.5 MB or wider than 3840 pixels fail the website's checks and block publishing.
- **Alt text** is optional but please add it: it is what people using screen readers hear. Describe what the image shows, for example "Three USC fighters escorting an Idris over Nyx". Do not start with "Image of". Leave it empty only for purely decorative images.
- **Image credit**: just the citizen's name, for example `Hadwin`. The site shows it as "In game image by USC-Citizen: Hadwin". Leave it empty for images that are not in-game screenshots.

## 5. Other things you can edit

| In the left menu | What it changes |
|---|---|
| News updates | The rows under "1.0 Notable News Updates" on the Media Network page. Untick **Visible** to hide one. Lower **Order** numbers come first. |
| Videos | Videos of the Month. The two with the newest **Month** are shown. Paste the YouTube ID (the part after `v=`). |
| Media Network page, The Citizen Compass page | Text on those pages. |
| Pages | Home, Our Vision, Leadership, Policies, Citizenship, Ministries. |
| Settings → Site settings | Application form link, contact email, social links. Ask the webdev team first. |

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
