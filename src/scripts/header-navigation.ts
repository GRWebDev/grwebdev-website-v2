const header = document.querySelector<HTMLElement>(".site-header__bar");
const donation = header?.querySelector<HTMLElement>(".site-header__donation");
const menu = header?.querySelector<HTMLDetailsElement>(
	".site-header__mobile-menu",
);
const menuList = menu?.querySelector("ul");
const summary = menu?.querySelector("summary");
const brand = header?.querySelector<HTMLElement>(".site-header__brand");
const links = header?.querySelector<HTMLElement>(".site-header__desktop-links");

if (header && donation && menu && menuList && summary && brand && links) {
	const donationItem = document.createElement("li");
	donationItem.className = "site-header__menu-donation";
	donationItem.hidden = true;
	menuList.append(donationItem);
	let headerFrame = 0;

	const moveDonation = (parent: HTMLElement, before: Element | null = null) => {
		if (donation.parentElement === parent) return;
		if (typeof parent.moveBefore === "function")
			parent.moveBefore(donation, before);
		else parent.insertBefore(donation, before);
	};

	const fitHeader = () => {
		headerFrame = 0;
		const wasOpen = menu.open;
		if (donation.parentElement === donationItem) menu.open = true;
		header.dataset.navigationStage = "measure";
		donation.dataset.measuring = "";
		const brandWidth = brand.getBoundingClientRect().width;
		const linksWidth = links.getBoundingClientRect().width;
		const donationWidth = donation.getBoundingClientRect().width;
		const menuWidth = Number.parseFloat(getComputedStyle(summary).inlineSize);
		const gap = Number.parseFloat(getComputedStyle(header).columnGap);
		const available = header.getBoundingClientRect().width;
		const linksBreakpoint = Math.ceil(
			brandWidth + linksWidth + donationWidth + 2 * gap,
		);
		const donationBreakpoint = Math.ceil(
			brandWidth + menuWidth + donationWidth + 2 * gap,
		);
		const stage =
			available >= linksBreakpoint
				? "links"
				: available >= donationBreakpoint
					? "menu"
					: "menu-donation";
		delete donation.dataset.measuring;
		menu.open = wasOpen;
		header.dataset.navigationStage = stage;
		if (stage === "menu-donation") {
			if (donation.contains(document.activeElement)) menu.open = true;
			donationItem.hidden = false;
			moveDonation(donationItem);
		} else {
			moveDonation(header, menu);
			donationItem.hidden = true;
		}
		if (stage === "links") menu.open = false;
	};
	const scheduleHeaderFit = () => {
		if (!headerFrame) headerFrame = requestAnimationFrame(fitHeader);
	};
	const observer = new ResizeObserver(scheduleHeaderFit);
	observer.observe(header);
	observer.observe(donation);
	document.fonts.ready.then(scheduleHeaderFit);
	customElements.whenDefined("givebutter-widget").then(() => {
		requestAnimationFrame(() => {
			const widget = donation.querySelector("givebutter-widget");
			if (widget?.shadowRoot) {
				new MutationObserver(scheduleHeaderFit).observe(widget.shadowRoot, {
					childList: true,
					subtree: true,
				});
			}
			scheduleHeaderFit();
		});
	});
	scheduleHeaderFit();
}
