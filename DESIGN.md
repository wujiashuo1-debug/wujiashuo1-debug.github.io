# Portfolio motion direction

Reference: https://www.itsoffbrand.com/ and the owner-supplied Refero style page.

The visual system keeps a parchment canvas, black Syne display type, Space Grotesk supporting type, Chinese system fonts and thin structural lines. Fonts are self-hosted under their included SIL licenses.

## Motion storyboard

There is exactly one persistent WebGL canvas, including during internal navigation. The sphere is part of the composition, not an ornament assigned to each section.

1. Establish identity. The full sphere sits among three large headline lines. This is the only centered composition.
2. Push in and pan right. As the introduction enters, the sphere grows into a cropped close-up. The headline lines separate and leave in sequence; the introduction opens into the space on the left. Both use the same scroll phase.
3. Hold for reading. The right crop remains steady while the biography passes. No corner dot, zigzag, or added destination during reading.
4. Bring work forward. The gallery occupies the right, while the sphere crosses into the left crop and then recedes below the cards. Reading takes priority over the object.
5. Open the field. Twelve original project diagrams and type fragments rise from below into a layered fan. The sphere returns behind them, becomes a left crop, then fades out as the field passes upward. A stable, readable skills grid follows the visual interlude.
6. Hold for evidence. Academic skills, Agent workflows and the Content Lab metric have a quiet background. The sphere does not return behind these reading sections or the home footer.
7. Change the visual lead. A soft-coloured cross with rounded tips and broad concave shoulders enters from below/right. Its rotation progresses from −55° to 170° throughout the zoom. One SVG aperture clips both the viewport-sized pastel background and the horizontal headline: letters appear inside the rotating shape while the surrounding page is still exposed. The headline has no opacity fade; only secondary text and the contact action enter later. Gradient direction turns gently with the aperture, preserving a visual cue as its edges leave the screen. The expanded panel holds before the ordinary footer returns.

Inner pages begin in a right-cropped composition, leaving their titles and narratives on the left. Site navigation replaces only the page shell; the canvas, time and ripple state remain alive, and the camera moves between page compositions without a new sphere appearing. Native URLs, back/forward, archive filters, metadata and standard full-page fallback remain available.

The scene is defined in camera-director.js from actual document section geometry. There are no arbitrary per-card camera waypoints. Motion uses analytic ray/ellipsoid intersection and geodesic wave derivatives, with frame-time-based pointer response. Rendering follows display refresh and adjusts resolution after sustained slow frames. Hidden pages suspend rendering. Reduced motion and the manual pause retain readable content. Mobile close-ups are cropped farther right and softened to keep text legible.

## Material and input — September 22 revision

The first full-spectrum prototype was rejected by the owner as too bright and harsh. The current prism-water.js uses broad pastel studio lights around a neutral pearl body: champagne above, rose at the side, ice blue below. Local contact changes surface normals and moves highlights; four damped geodesic waves relax after contact. Avoid returning to a saturated HSV rainbow across the entire surface.

The strengthened ripple pass uses a broader wave packet and almost twice the displacement amplitude, with slower decay and wider crest spacing. White crest reflection and soft trough shading describe the relief. A translucent outer halo samples the same waves at the silhouette: arriving wave energy locally increases its brightness and spread, then relaxes to a thin quiet rim. Additional wave samples are limited to the silhouette band; no extra canvas, CSS glow animation or full-screen blur is used.

Fine-pointer devices keep the native cursor and add a solid 10px difference-blended dot centred exactly on its tip at rest, with no offset. An analytically integrated critically damped spring (angular frequency 32/s) gives slight initial lag, accelerating catch-up and a smooth settling motion. Links, enabled controls and other interactive targets enlarge the dot to 18px. Touch devices and paused/reduced-motion mode show no follower. Cursor and water never intercept clicks. Scroll choreography has a short 85ms interpolation; native scrolling itself is not intercepted.

The burst diagrams are decorative derivatives of the labelled project maps, not claimed production screenshots. When motion is paused, visual tiles form a normal grid and the finale becomes a static pastel panel, without extra empty scroll distance.

## Reading flow

The home chapter index offers direct access to introduction, selected work, skills and content practice, plus Contact. Selected work opens with Listing Agent, Web tools and Content Lab, so concrete technical work and confirmed outcomes appear first. The skills chapter starts entering before the visual interlude has fully left the viewport; sphere retirement uses the same normalized interlude progression. The colour finale is the only full contact invitation on the home page, followed by a compact footer. Inner pages retain their contact footer. In-page back/forward restores position without replacing the page, and returning from a case study respects the saved scroll position even when the home URL contains a chapter anchor.

## Content integrity

The portfolio includes the owner's Listing Agent, academic foundation, business projects and 红果装备档案 with confirmed current profit RMB 12,000. LangGraph remains marked as basic understanding. Course agriculture work and the unused second content account are omitted. Project diagrams are labelled as illustrations; missing original materials are tracked in CONTENT-TODO.md. No invented deployment stack, business growth rates, employment history or research accuracy.
