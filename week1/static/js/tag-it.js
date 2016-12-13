/*
* jQuery UI Tag-it!
*
* @version v2.0 (06/2011)
*
* Copyright 2011, Levy Carneiro Jr.
* Released under the MIT license.
* http://aehlke.github.com/tag-it/LICENSE
*
* Homepage:
*   http://aehlke.github.com/tag-it/
*
* Authors:
*   Levy Carneiro Jr.
*   Martin Rehfeld
*   Tobias Schmidt
*   Skylar Challand
*   Alex Ehlke
*
* Maintainer:
*   Alex Ehlke - Twitter: @aehlke
*
* Dependencies:
*   jQuery v1.4+
*   jQuery UI v1.8+
*/
(function($) {

    $.widget('ui.tagit', {
        options: {
            allowDuplicates   : false,
            caseSensitive     : true,
            fieldName         : 'tags',
            placeholderText   : null,   // Sets `placeholder` attr on input field.
            readOnly          : false,  // Disables editing.
            removeConfirmation: false,  // Require confirmation to remove tags.
            tagLimit          : 10,   // Max number of tags allowed (null for unlimited).

            // Used for autocomplete, unless you override `autocomplete.source`.
            availableTags     : { "Advertising" , "Advertisement management", "Archery", "Acoustic"
, "Animation", "Ad Targeting", "Adobe Premiere", "Adobe Photoshop"
, "Aikido", "Administration", "Abstract Painting", "Accounting"
, "Audio Transcription", "Account Resolution", "Accounting Policy", "Art Collage"
, "Accounting Software", "Accounting Analysis", "Accounting Research", "Accounting Consulting"
, "Accounting Management", "Adobe Creative Suite", "Adobe Illustrator", "App Builder"
, "Auditing", "Acting", "Acting Coach", "Ad Targeting"
, "Algebra", "Application Management Services", "Actor's Management", "Art curation"
, "Architectural Design", "Apartment renovation", "Apartment design", "Architectural Management"
, "Amazon Marketplace", "Amazon Web Services (AWS)", "After Effects", "Arts & Crafts"
, "Artworks", "Artist Management", "Athlete Management", "Art Promotion"
, "American Football", "Arts Journalism", "Audio-visual Production", "Athleticm"
, "AutoCAD", "Bass", "Book Art", "Broacast Advertising"
, "Broadcast Journalism", "British Literature", "Business Management", "Business Technology Optimization"
, "Billing Management", "Blogging", "Boxing", "Brand Marketing"
, "Budgeting & Forecasting", "Behavioral Analytics", "Body Paint", "Bollywood"
, "Bollywood Dance Choreography", "Bossa Nova", "Business Development", "Business Building"
, "Business Analysis", "Business Solutions", "Business Risk Assessment", "Business Strategy"
, "Business Process Improvement", "Ballet", "Ball Dance", "Bootstrap"
, "Buzz Marketing", "Business-to-Business (B2B)", "Business Intelligence", "Business Process"
, "Career Development Consulting", "Customer Service", "Catering", "Casting Agent"
, "Casting", "Catering Management", "Contract Management", "Contract Assessment"
, "Conceptual Sketching", "Conceptual Design", "Contract Negotiation", "Coaching"
, "Customer Relationship Management (CRM)", "CSS", "C++", "C++ Builder"
, "Contemporary Art", "Contemorary Dance", "Clothes Restyling", "Contemporary Theater"
, "Communication", "Communication Coaching", "Community Outreach", "CD Art Creation"
, "Child Raising", "Chinese", "Child Development", "Conductor"
, "C#", "C", "Charcoal Drawing", "C Level Relations"
, "Campaign management", "Career Coaching", "Circuit Training", "Company Direction"
, "Company Valuation", "Company Launch", "Company Management", "Community Service"
, "Computational Intelligence", "Clarinet", "Computer Science", "Corporate Law"
, "Creative Writing", "Customer Satisfaction", "Customer Complaints", "Capoeira"
, "Costume Design", "Computer Graphics", "Cooking", "Cuisine"
, "Cooking Instruction", "Customer Needs", "Chemistry", "Chemical Physics"
, "Client Growth", "Client Development", "Client Management", "Computational Linguistics"
, "Customized Training", "Climate Change Policy", "Communication Architecture", "Collage"
, "Communication Strategy", "Communication Training", "Communication Consulting", "Computer Operations"
, "Contract Law", "Crisis Resolution", "Criminal Law", "Culinary Arts"
, "Crisis Intervention", "Choreography", "Crisis Management", "Concept Design"
, "Data Analysis", "DNA Analysis", "Data Mining", "Database Queries"
, "Design", "Design Analysis", "Dance", "Dance Choreographer"
, "DJ", "Data Recording", "DIY", "Dentistry"
, "Desktop Hardware", "Dietician", "Data Grid", "Data Management"
, "Data Tracking", "Data Curation", "Debugging", "Design Implementation"
, "Disease Control", "Document Research", "DJ", "Digital Painting"
, "Directory Management", "Data Retrieval", "Disaster Management", "Disaster Recovery"
, "Data Recovery", "Digital Marketing", "Due Diligence", "Data Center Management"
, "Documentary Filmmaking", "Documentary Photography", "Direct Sales", "Drums"
, "Diving", "Event Planning", "Editing", "Employee Relations"
, "English", "Email Marketing", "Espa_ol", "Event Management"
, "Entrepreneurship", "Engineering", "Electrical Engineering", "E-commerce"
, "E-commerce systems management", "E-commerce development", "Editorial Consulting", "Employment Verification"
, "Engineering Research", "Entertainment Software", "Environmental Training", "Environmental Protection"
, "Environmental Analysis", "Equity Funding", "Executive Oversight", "Exit Strategies"
, "Exit Consultant", "Education", "Education Law", "Election Monitoring"
, "Electronic Security", "Embedded Java", "Employee Consultation", "Energy Management"
, "Engineering Statistics", "Employment Law", "E-commerce Consulting", "Education Management"
, "Electrical Layouts", "Electronic Security Systems", "Employee Development", "Energy Policy"
, "Energy Consumption Monitory", "Energy Management", "Entrepreneur Coaching", "Flute"
, "Financial Planning", "Financial Reporting", "Fuel Management", "Federal Regulations"
, "Field Inspection", "Film Costume Design", "Film Acting", "Front-end Engineering"
, "Film Criticism", "Film Photography", "Film Editor", "Film Lighting"
, "Film Processing", "Film Scoring", "Film Sound", "Film Direction"
, "Film Finance", "Film Marketing", "Film Production", "Film Cameras"
, "Film Distribution", "Film History", "Film Restoration", "Financial Assistance"
, "Flower Arrangement", "Food Services", "Food Catering", "Framework Management"
, "Fiscal Policy", "Fundraising", "Fundraising Consultant", "Fundraising Management"
, "Field Supervision", "Football", "Finance", "Fraud Management"
, "Front-end Development", "Furniture Assembly", "Fashion Styling", "Fencing"
, "Final Cut", "Final Cut Pro", "Finance Law", "Financial Planner"
, "Fine Art", "Fine Art Sales", "Financial Modeling", "Financial Analysis"
, "Fashion Design", "Fashion", "Facebook Marketing", "Forecasting"
, "Family Law", "Family Photography", "Family Consultation", "Grant Writing"
, "Graphics", "Graphic Illustrations", "Graphic Recording", "Graphical User Interface (GUI)"
, "Graphics Editing", "Graphic Novels", "Graphics Creation", "Graphic Solutions"
, "Graphical Models", "Graphics Development", "Graphic Design", "Green Building"
, "Google Analytics", "GitHub", "Government", "Green Screen Production"
, "Green Screen Editing", "Geographic Information System (GIS)", "GMP", "Gaming"
, "Game Consultant", "General Corporate Practice", "Global HR", "Global Leadership"
, "Government Project", "Golf", "Government Accountability", "Graphics Hardware"
, "Green Strategies", "Growth Management", "Guided Tours", "Game Design"
, "Game Scripting", "Gene Therapy", "Guitar", "Gas Accounting"
, "Healthcare", "Hiring", "Hospitality Management", "Human Resoures"
, "HTML", "Health Resources", "Health Education", "Hospitals"
, "Higher Education", "Healthcare Management", "Healthcare Information Technology (HIT)", "Hand to Hand Combat"
, "Health Journalism", "Home Video", "Horse Training", "Harp"
, "Hospital Operations", "Housing Finance", "Human Services", "Hair Styling"
, "Health Sciences", "Home Cleaning", "Home Management", "Home Security"
, "HTML", "Hotel Management", "Handyman", "Hardware"
, "Hardware Planning", "Health & Wellness", "High School Education", "Hip-Hop"
, "High Court", "History of Art", "Homeland Defense", "House Painting"
, "Home Decor", "Home Depot", "Home Finding", "Home Improvement"
, "Home Marketing", "Home Furnishings", "Home Infusion", "Home Medical Equipment"
, "Home Equity Loans", "Home Management", "Human Rights Law", "Human Resources"
, "Human Rights", "Human Rights Education", "Human Security", "Human Rights Research"
, "Information Visualization", "Integrated Circuits", "International Business Law", "Industrial Engineering"
, "Infrastructure Management", "Interactive Displays", "International Development", "Icons"
, "Interactive Video", "Internal Audit", "International Human Rights", "Interior Design"
, "Investment Policy", "Internet Product Development", "Investor Relations Support", "Investments"
, "Inspection", "Integration", "International Sales", "Illustrator"
, "Interviewing", "Insurance", "InDesign", "Interactive Design"
, "Internet Technology", "Internet Troubleshooting", "Industry Research", "Java"
, "Java Enterprise Edition", "JavaScript", "JavaServer Pages (JSP)", "JIRA"
, "Journalism", "JSON", "JQuery", "Jazz"
, "Joint Ventures", "Java Script Frameworks", "Java Operating Systems", "Judo"
, "Java Software Development", "Jewelry-making", "K -12 Education", "Knitwear"
, "Karate", "Keyboard Programming", "Kiosk Development", "Knitting"
, "Knowledge Engineering", "Kickboxing", "Knowledge Management Systems", "Labor Disputes"
, "Land Use Litigation", "Language Teaching", "Laser Art", "Layout Design"
, "Legal Process Outsourcing", "Legal Support Services", "Logos", "Live Painting"
, "Lyrics Composition", "Logo Creation", "Licensing Negotiations", "Labour Management"
, "Landscape", "Landscape Design", "Licensing Strategy", "Liability"
, "Logistics Management", "Localization", "Localization Testing", "Location Recording"
, "Location Lighting", "Location Permit Handling", "M & A", "M& A Integration"
, "Management Skills Development", "Market Valuation", "Marketing Kits", "Marketing Communications"
, "Marketing Engineering", "Marketing Analytics", "Marketing Compliance", "Marketing Coaching"
, "Marketing Strategy", "Marketing Graphics", "Mapping", "Marketing Kits"
, "Marketing Consulting", "Mathematics", "Medical Stimulation", "Music Video Production"
, "Management Software", "Music Management", "Music Lessons", "Music Composition"
, "Music Making", "Music Review", "Manufacturing Intelligence", "Marketing Law"
, "Mobile App Development", "Mobile App Design", "Mobile Mapping", "Mobile Networks"
, "Make Up Art", "Mobile Messaging", "Mobile Interaction Design", "Mobile Experience Design"
, "Music Therapy", "Music Selection", "Music Journalism", "Music Licensing"
, "Music Reviews", "Music Law", "Music Performance", "Music Programming"
, "Music Scheduling", "Music Remixing", "Music Technology", "Music Marketing"
, "Music Production", "Music Publishing", "Music Consultant", "Music Labels"
, "Music Supervision", "Music Transcription", "Music Management", "Management"
, "Music Industry", "Magazine Management", "Market Landscape Analysis", "Market Evaluation"
, "Market Research", "Market Reporting", "Mechanical Engineering", "Medicine"
, "Mobile Device Management", "Mobile Security", "Metal Music", "Mobile Payments"
, "Mobile Search", "Mobile TV", "Mobile Social Networking", "Mixed Martial Arts"
, "Martial Arts", "Mechanical Product Design", "Measurement Systems", "Measurement System Analysis"
, "Mass Email Marketing", "Mass Marketing", "Massage Therapy", "Mass Storage"
, "Multi-Channel Network", "Mask", "Mask and Compositing", "Nonprofits"
, "Nutrition", "Nursing Education", "Newsletters", "Network Security"
, "Nursing", "Network Administration", "Nano", "Nanomechanics"
, "Net App", "Network Coding", "Narration", "Network Discovery"
, "Network Solutions", "Neurosurgery", "Nature Videography", "Nature Photography"
, "New Account Acquisition", "New Home Purchase", "Non-Governmental Organizations (NGOs)", "Nonlinear Optimization"
, "Notary", "Nuclear Licensing", "Nuclear Technology", "Nanomedicine"
, "Nail Art", "New Business Launch", "New Media Marketing", "Nonprofit Consulting"
, "Natural Disasters", "Negotiation", "Network Load Balancing", "Network Optimization"
, "Neurochemistry", "Nem Media Product Development", "New Solutions", "Non-profit Consulting"
, "Nursing Homes", "Nature Tours", "Negotiation Training", "Network Performance"
, "Newsgathering", "News Researcher", "Non-profit Development", "Nursing Management"
, "Nutrition Consulting", "Office Web Apps", "Online Business Management", "Online Product Launches"
, "Online Systems", "Open CMS", "Open Innovation", "Operating Environment"
, "Organizational Capability Building", "Online Business Optimization", "Open Source Integration", "Operational Due Diligence"
, "Online Data Entry", "Operations", "Operational Efficiency", "Operational Oversight"
, "Organizational Planning", "Online Product Development", "Operational Planning", "Optical Engineering"
, "Oracle Fusion Middleware", "Organizational Digital Transformation", "Oncology", "Operations Management"
, "Operating Systems", "Oracle", "Office Management", "Outsourcing"
, "Oil Paint", "Oil & Gas", "Online Marketing", "Organizational Development"
, "P & L Oversight", "Patent Portfolio Development", "Patient Relations", "Performance Re-engineering"
, "Personnel Evaluation", "Photo-illustration", "Photo Retouching", "Policy Issues"
, "Product Recovery", "Project Portfolio Management", "Public Policy", "Physical Trainer"
, "Public Policy Research", "Photoshop", "Python", "Pre-sales Consultation"
, "Production Coordination", "Production Stills", "Profit Margins", "Program Evaluation and Review Technique (PERT)"
, "Projects Coordination", "Public Process", "Publications", "Painting"
, "Pharmaceutical Industry", "Physical Optics", "Pre-sales Efforts", "Photography"
, "Print Literature", "Product Allocation", "Product Identification", "Program Execution"
, "Poster Creation", "Property Management", "Publicist", "Patent Portfolio Analysis"
, "Peacebuilding", "Pharmaceutical Law", "Programmer", "Project Communications"
, "Projection Art", "Projection Mapping", "Project Management", "Product Manager"
, "Psychoanalysis", "Programming", "Project Co-ordination", "Project Architecture"
, "Product Innovation", "Product Leadership", "Product Line", "Product Management Skills"
, "Product Portfolio", "Product Re-engineering", "Product Improvement", "Product Introduction"
, "Product Liability", "Product Operations", "Product Photography", "Product Presentation"
, "Product Incubation", "Product Knowledge", "Product Manufacturing", "Product Modeling"
, "Product Optimization", "Product Placement", "Product Information Management", "Product Knowledge & Training"
, "Product Launching", "Product Lifecycle Management", "Product Launching", "Product Mapping"
, "Product Planning", "Public Relations", "Project Planning", "Patient Safety"
, "Public Speaking", "Program Management", "Performance Management", "PowerPoint"
, "Product Development", "Proof-Reading", "Producing", "Problem Solving"
, "Payroll", "Peace Studies", "Portrait Painting", "Peace Education"
, "Peace Talks", "Peace Negotiation", "Payment Services", "PayPal Integration"
, "Payroll Cards", "Pop", "Peacekeeping", "Peacebuilding"
, "Peacemaker", "Pediatrics", "Percussion", "Pedicures"
, "Piano", "Pediatric Nursing", "Qualification Testing", "Qualitative Research"
, "Quality Improvement Tools", "Quality Management", "Quality Reporting", "Quora"
, "Quantitative Analysis", "Quantitative Analyses", "Quantitative Modeling", "Quantative Risk"
, "Quality Patient Care", "Quality Of Care", "Quality Control", "Quantification"
, "Quantitative Risk Analysis", "Quantitative Finance", "Quantitative Data", "Quantum Theory"
, ""Quality, Health, Safety, and Environment"", "Quality Inspection", "Quality Investigations", "Quality Assurance"
, "Quality System", "Quality Improvement", "Quantitative Research", "Research"
, "Radiation", "Real Estate", "Real Estate Investor", "Recording"
, "Refinancing", "Relationship Development", "Research Computing", "Risk Analysis"
, "Risk Consulting", "Risk Governance", "Rap", "Risk Measurement"
, "R&B", "Risk Engineering", "Risk Intelligence", "Risk Monitoring"
, "Risk Modeling", "Risk Operations", "Risk Frameworks", "Risk Management Consulting"
, "Risk Management Tools", "Risk Modelling", "Risk Profiling", "Robotic Surgery"
, "Radiation Monitoring", "Re-organisations", "Rehabilitation Counseling", "Research Consulting"
, "Resource Development", "Radio", "Retreat Facilitation", "Return on Investment Analysis"
, "Returns Management", "Retail Financing", "Ruby on Rails", "Retail Solutions"
, "Recruitment", "Reggae", "Reggaeton", "Requirements Analysis"
, "Risk Assessment", "Rock", "Retail", "Rugby"
, "Risk Management", "Residential Homes", "Saxophone", "Safety Planning"
, "Sales & Distribution", "Scenario Analysis", "Service Delivery", "Service Strategies"
, "Shareholder Value", "Soft Rock", "Shipping & Receiving", "Service Planning"
, "Service Design", "Service Quality", "Software Docmentation", "Streaming Media"
, "Supply Chain Management", "Sales & Marketing", "Securities Offerings", "Salsa"
, "Service Test", "Serviced Office", "Soccer", "Services Development"
, "Software Safety", "Security Research", "Site Server", "Social Media Consulting"
, "Social Media Development", "Social Media Management", "Social Network Strategy", "Social Networking Apps"
, "Social Media-Marketing", "Samba Dance", "Samba Music", "Sound Design"
, "Sound Effects", "SnapChat", "Social Media ROI", "Sound Recording"
, "Sports", "Sports Training", "Sound Mixing", "Sound Engineering"
, "Sound Editing", "Stylist", "Staff Scheduling", "Strategic Design"
, "Structural Mechanics", "Surveillance", "Sustainable Energy", "Synthesizers"
, "System Development", "Safety Pharmacology", "Social Media Asset Creation", "SNS Banner Creation"
, "Scientific Writing", "Screen-writing", "Screenplays", "Security Risk"
, "Sustainable Engineering", "System Development Methodolgy", "System Operation", "System Planning"
, "System Specification", "System Recovery", "System Sizing", "System Mapping"
, "System Organization", "Special Effects Make Up", "Special Effects Body Paint", "System Testing"
, "Singing", "System Verification", "Sketch", "System Evaluation"
, "Studio Photography", "Slack", "System Solutions", "Song Selection"
, "Theater", "Theater Acting", "Theater Production", "Television Producing"
, "Trading Systems", "Traffic Engineering", "Tamborine", "Tax Accounting"
, "Tax Research", "Tax Planning", "Tax Policy", "Tabla"
, "Theater Costume Design", "Tax Dispute Resolution", "Talent Development", "Tax Reporting"
, "Trailer Creation", "Transportation Law", "Technology Implementations", "Technology M&A"
, "Technology Art", "Technology Art Design", "Technology Integration", "Theater Direction"
, "Theater Choreography", "Technology Marketing", "Tennis", "Technology Investment"
, "Typography", "Think Tank", "3D Printing", "Printing"
, "Photography Printing", "Urban Art", "User Experience Testing", "Underwater Photography"
, "Underwater Videography", "Utilities Management", "Utility Mapping", "Urban Planning"
, "User Experience Design", "User Experience Strategy", "User Experience Engineer", "UX Design"
, "UI Design", "Useability", "User Analysis", "User Interface"
, "Uber", "User Modeling", "User Research", "Utility Rate Analysis"
, "Utilization Analysis", "Utilization Management", "UI Kit", "UIT"
, "UI Testing", "UX Testing", "User Interface Design", "User Experience"
, "University Teaching", "UX Consultant", "UI Consultant", "Violin"
, "Voice Acting", "Volunteering", "Vector Design", "Vector Ilustration"
, "Vendor Management Skills", "Visual Design", "Visual Effects", "Voice Training"
, "Visual Effects Editor", "Visual Effects and Compositing", "VR Production", "VR Painting"
, "VR Software Development", "VR Editing", "VR Content Production", "Visual Editing"
, "Vide & Audio", "VJ", "Video Jockey", "Video Production"
, "Visual Merchandising", "Valuation", "Video Editing", "Web Services"
, "Web Development", "Webdesign", "Web Design", "Web-based Solutions"
, "Workforce Education", "Web Content Creation", "Web-based Surveys", "Web Engineering"
, "Workshop Development", "Workshop Instructor", "Web Application Development", "Weaving"
, "Web Research", "Website Localization", "WordPress", "XHTML"
, "Xcode", "XML", "XSI", "XSLT"
, "Xbox", "Xbox 360", "360 Filming", "360 Film Production"
, "YouTube Content Creation", "YouTube Creator Management", "Yoga", "Yoga Instruction"
, "Yatching", "Youth Advocacy", "Youth Activism", "Youth Outreach"
, "Youth Leadership Training", "Youth Programming", "360 Audio Recording", "Zumba"
},

            // Use to override or add any options to the autocomplete widget.
            //
            // By default, autocomplete.source will map to availableTags,
            // unless overridden.
            autocomplete: {delay: 0, minLength: 1},

            // Shows autocomplete before the user even types anything.
            showAutocompleteOnFocus: false,

            // When enabled, quotes are unneccesary for inputting multi-word tags.
            allowSpaces: false,

            // The below options are for using a single field instead of several
            // for our form values.
            //
            // When enabled, will use a single hidden field for the form,
            // rather than one per tag. It will delimit tags in the field
            // with singleFieldDelimiter.
            //
            // The easiest way to use singleField is to just instantiate tag-it
            // on an INPUT element, in which case singleField is automatically
            // set to true, and singleFieldNode is set to that element. This
            // way, you don't need to fiddle with these options.
            singleField: false,

            // This is just used when preloading data from the field, and for
            // populating the field with delimited tags as the user adds them.
            singleFieldDelimiter: ',',

            // Set this to an input DOM node to use an existing form field.
            // Any text in it will be erased on init. But it will be
            // populated with the text of tags as they are created,
            // delimited by singleFieldDelimiter.
            //
            // If this is not set, we create an input node for it,
            // with the name given in settings.fieldName.
            singleFieldNode: null,

            // Whether to animate tag removals or not.
            animate: true,

            // Optionally set a tabindex attribute on the input that gets
            // created for tag-it.
            tabIndex: null,

            // Event callbacks.
            beforeTagAdded      : null,
            afterTagAdded       : null,

            beforeTagRemoved    : null,
            afterTagRemoved     : null,

            onTagClicked        : null,
            onTagLimitExceeded  : null,


            // DEPRECATED:
            //
            // /!\ These event callbacks are deprecated and WILL BE REMOVED at some
            // point in the future. They're here for backwards-compatibility.
            // Use the above before/after event callbacks instead.
            onTagAdded  : null,
            onTagRemoved: null,
            // `autocomplete.source` is the replacement for tagSource.
            tagSource: null
            // Do not use the above deprecated options.
        },

        _create: function() {
            // for handling static scoping inside callbacks
            var that = this;

            // There are 2 kinds of DOM nodes this widget can be instantiated on:
            //     1. UL, OL, or some element containing either of these.
            //     2. INPUT, in which case 'singleField' is overridden to true,
            //        a UL is created and the INPUT is hidden.
            if (this.element.is('input')) {
                this.tagList = $('<ul></ul>').insertAfter(this.element);
                this.options.singleField = true;
                this.options.singleFieldNode = this.element;
                this.element.addClass('tagit-hidden-field');
            } else {
                this.tagList = this.element.find('ul, ol').andSelf().last();
            }

            this.tagInput = $('<input type="text" />').addClass('ui-widget-content');

            if (this.options.readOnly) this.tagInput.attr('disabled', 'disabled');

            if (this.options.tabIndex) {
                this.tagInput.attr('tabindex', this.options.tabIndex);
            }

            if (this.options.placeholderText) {
                this.tagInput.attr('placeholder', this.options.placeholderText);
            }

            if (!this.options.autocomplete.source) {
                this.options.autocomplete.source = function(search, showChoices) {
                    var filter = search.term.toLowerCase();
                    var choices = $.grep(this.options.availableTags, function(element) {
                        // Only match autocomplete options that begin with the search term.
                        // (Case insensitive.)
                        return (element.toLowerCase().indexOf(filter) === 0);
                    });
                    if (!this.options.allowDuplicates) {
                        choices = this._subtractArray(choices, this.assignedTags());
                    }
                    showChoices(choices);
                };
            }

            if (this.options.showAutocompleteOnFocus) {
                this.tagInput.focus(function(event, ui) {
                    that._showAutocomplete();
                });

                if (typeof this.options.autocomplete.minLength === 'undefined') {
                    this.options.autocomplete.minLength = 0;
                }
            }

            // Bind autocomplete.source callback functions to this context.
            if ($.isFunction(this.options.autocomplete.source)) {
                this.options.autocomplete.source = $.proxy(this.options.autocomplete.source, this);
            }

            // DEPRECATED.
            if ($.isFunction(this.options.tagSource)) {
                this.options.tagSource = $.proxy(this.options.tagSource, this);
            }

            this.tagList
                .addClass('tagit')
                .addClass('ui-widget ui-widget-content ui-corner-all')
                // Create the input field.
                .append($('<li class="tagit-new"></li>').append(this.tagInput))
                .click(function(e) {
                    var target = $(e.target);
                    if (target.hasClass('tagit-label')) {
                        var tag = target.closest('.tagit-choice');
                        if (!tag.hasClass('removed')) {
                            that._trigger('onTagClicked', e, {tag: tag, tagLabel: that.tagLabel(tag)});
                        }
                    } else {
                        // Sets the focus() to the input field, if the user
                        // clicks anywhere inside the UL. This is needed
                        // because the input field needs to be of a small size.
                        that.tagInput.focus();
                    }
                });

            // Single field support.
            var addedExistingFromSingleFieldNode = false;
            if (this.options.singleField) {
                if (this.options.singleFieldNode) {
                    // Add existing tags from the input field.
                    var node = $(this.options.singleFieldNode);
                    var tags = node.val().split(this.options.singleFieldDelimiter);
                    node.val('');
                    $.each(tags, function(index, tag) {
                        that.createTag(tag, null, true);
                        addedExistingFromSingleFieldNode = true;
                    });
                } else {
                    // Create our single field input after our list.
                    this.options.singleFieldNode = $('<input type="hidden" style="display:none;" value="" name="' + this.options.fieldName + '" />');
                    this.tagList.after(this.options.singleFieldNode);
                }
            }

            // Add existing tags from the list, if any.
            if (!addedExistingFromSingleFieldNode) {
                this.tagList.children('li').each(function() {
                    if (!$(this).hasClass('tagit-new')) {
                        that.createTag($(this).text(), $(this).attr('class'), true);
                        $(this).remove();
                    }
                });
            }

            // Events.
            this.tagInput
                .keydown(function(event) {
                    // Backspace is not detected within a keypress, so it must use keydown.
                    if (event.which == $.ui.keyCode.BACKSPACE && that.tagInput.val() === '') {
                        var tag = that._lastTag();
                        if (!that.options.removeConfirmation || tag.hasClass('remove')) {
                            // When backspace is pressed, the last tag is deleted.
                            that.removeTag(tag);
                        } else if (that.options.removeConfirmation) {
                            tag.addClass('remove ui-state-highlight');
                        }
                    } else if (that.options.removeConfirmation) {
                        that._lastTag().removeClass('remove ui-state-highlight');
                    }

                    // Comma/Space/Enter are all valid delimiters for new tags,
                    // except when there is an open quote or if setting allowSpaces = true.
                    // Tab will also create a tag, unless the tag input is empty,
                    // in which case it isn't caught.
                    if (
                        (event.which === $.ui.keyCode.COMMA && event.shiftKey === false) ||
                        event.which === $.ui.keyCode.ENTER ||
                        (
                            event.which == $.ui.keyCode.TAB &&
                            that.tagInput.val() !== ''
                        ) ||
                        (
                            event.which == $.ui.keyCode.SPACE &&
                            that.options.allowSpaces !== true &&
                            (
                                $.trim(that.tagInput.val()).replace( /^s*/, '' ).charAt(0) != '"' ||
                                (
                                    $.trim(that.tagInput.val()).charAt(0) == '"' &&
                                    $.trim(that.tagInput.val()).charAt($.trim(that.tagInput.val()).length - 1) == '"' &&
                                    $.trim(that.tagInput.val()).length - 1 !== 0
                                )
                            )
                        )
                    ) {
                        // Enter submits the form if there's no text in the input.
                        if (!(event.which === $.ui.keyCode.ENTER && that.tagInput.val() === '')) {
                            event.preventDefault();
                        }

                        // Autocomplete will create its own tag from a selection and close automatically.
                        if (!(that.options.autocomplete.autoFocus && that.tagInput.data('autocomplete-open'))) {
                            that.tagInput.autocomplete('close');
                            that.createTag(that._cleanedInput());
                        }
                    }
                }).blur(function(e){
                    // Create a tag when the element loses focus.
                    // If autocomplete is enabled and suggestion was clicked, don't add it.
                    if (!that.tagInput.data('autocomplete-open')) {
                        that.createTag(that._cleanedInput());
                    }
                });

            // Autocomplete.
            if (this.options.availableTags || this.options.tagSource || this.options.autocomplete.source) {
                var autocompleteOptions = {
                    select: function(event, ui) {
                        that.createTag(ui.item.value);
                        // Preventing the tag input to be updated with the chosen value.
                        return false;
                    }
                };
                $.extend(autocompleteOptions, this.options.autocomplete);

                // tagSource is deprecated, but takes precedence here since autocomplete.source is set by default,
                // while tagSource is left null by default.
                autocompleteOptions.source = this.options.tagSource || autocompleteOptions.source;

                this.tagInput.autocomplete(autocompleteOptions).bind('autocompleteopen.tagit', function(event, ui) {
                    that.tagInput.data('autocomplete-open', true);
                }).bind('autocompleteclose.tagit', function(event, ui) {
                    that.tagInput.data('autocomplete-open', false);
                });

                this.tagInput.autocomplete('widget').addClass('tagit-autocomplete');
            }
        },

        destroy: function() {
            $.Widget.prototype.destroy.call(this);

            this.element.unbind('.tagit');
            this.tagList.unbind('.tagit');

            this.tagInput.removeData('autocomplete-open');

            this.tagList.removeClass([
                'tagit',
                'ui-widget',
                'ui-widget-content',
                'ui-corner-all',
                'tagit-hidden-field'
            ].join(' '));

            if (this.element.is('input')) {
                this.element.removeClass('tagit-hidden-field');
                this.tagList.remove();
            } else {
                this.element.children('li').each(function() {
                    if ($(this).hasClass('tagit-new')) {
                        $(this).remove();
                    } else {
                        $(this).removeClass([
                            'tagit-choice',
                            'ui-widget-content',
                            'ui-state-default',
                            'ui-state-highlight',
                            'ui-corner-all',
                            'remove',
                            'tagit-choice-editable',
                            'tagit-choice-read-only'
                        ].join(' '));

                        $(this).text($(this).children('.tagit-label').text());
                    }
                });

                if (this.singleFieldNode) {
                    this.singleFieldNode.remove();
                }
            }

            return this;
        },

        _cleanedInput: function() {
            // Returns the contents of the tag input, cleaned and ready to be passed to createTag
            return $.trim(this.tagInput.val().replace(/^"(.*)"$/, '$1'));
        },

        _lastTag: function() {
            return this.tagList.find('.tagit-choice:last:not(.removed)');
        },

        _tags: function() {
            return this.tagList.find('.tagit-choice:not(.removed)');
        },

        assignedTags: function() {
            // Returns an array of tag string values
            var that = this;
            var tags = [];
            if (this.options.singleField) {
                tags = $(this.options.singleFieldNode).val().split(this.options.singleFieldDelimiter);
                if (tags[0] === '') {
                    tags = [];
                }
            } else {
                this._tags().each(function() {
                    tags.push(that.tagLabel(this));
                });
            }
            return tags;
        },

        _updateSingleTagsField: function(tags) {
            // Takes a list of tag string values, updates this.options.singleFieldNode.val to the tags delimited by this.options.singleFieldDelimiter
            $(this.options.singleFieldNode).val(tags.join(this.options.singleFieldDelimiter)).trigger('change');
        },

        _subtractArray: function(a1, a2) {
            var result = [];
            for (var i = 0; i < a1.length; i++) {
                if ($.inArray(a1[i], a2) == -1) {
                    result.push(a1[i]);
                }
            }
            return result;
        },

        tagLabel: function(tag) {
            // Returns the tag's string label.
            if (this.options.singleField) {
                return $(tag).find('.tagit-label:first').text();
            } else {
                return $(tag).find('input:first').val();
            }
        },

        _showAutocomplete: function() {
            this.tagInput.autocomplete('search', '');
        },

        _findTagByLabel: function(name) {
            var that = this;
            var tag = null;
            this._tags().each(function(i) {
                if (that._formatStr(name) == that._formatStr(that.tagLabel(this))) {
                    tag = $(this);
                    return false;
                }
            });
            return tag;
        },

        _isNew: function(name) {
            return !this._findTagByLabel(name);
        },

        _formatStr: function(str) {
            if (this.options.caseSensitive) {
                return str;
            }
            return $.trim(str.toLowerCase());
        },

        _effectExists: function(name) {
            return Boolean($.effects && ($.effects[name] || ($.effects.effect && $.effects.effect[name])));
        },

        createTag: function(value, additionalClass, duringInitialization) {
            var that = this;

            value = $.trim(value);

            if(this.options.preprocessTag) {
                value = this.options.preprocessTag(value);
            }

            if (value === '') {
                return false;
            }

            if (!this.options.allowDuplicates && !this._isNew(value)) {
                var existingTag = this._findTagByLabel(value);
                if (this._trigger('onTagExists', null, {
                    existingTag: existingTag,
                    duringInitialization: duringInitialization
                }) !== false) {
                    if (this._effectExists('highlight')) {
                        existingTag.effect('highlight');
                    }
                }
                return false;
            }

            if (this.options.tagLimit && this._tags().length >= this.options.tagLimit) {
                this._trigger('onTagLimitExceeded', null, {duringInitialization: duringInitialization});
                return false;
            }

            var label = $(this.options.onTagClicked ? '<a class="tagit-label"></a>' : '<span class="tagit-label"></span>').text(value);

            // Create tag.
            var tag = $('<li></li>')
                .addClass('tagit-choice ui-widget-content ui-state-default ui-corner-all')
                .addClass(additionalClass)
                .append(label);

            if (this.options.readOnly){
                tag.addClass('tagit-choice-read-only');
            } else {
                tag.addClass('tagit-choice-editable');
                // Button for removing the tag.
                var removeTagIcon = $('<span></span>')
                    .addClass('ui-icon ui-icon-close');
                var removeTag = $('<a><span class="text-icon">\xd7</span></a>') // \xd7 is an X
                    .addClass('tagit-close')
                    .append(removeTagIcon)
                    .click(function(e) {
                        // Removes a tag when the little 'x' is clicked.
                        that.removeTag(tag);
                    });
                tag.append(removeTag);
            }

            // Unless options.singleField is set, each tag has a hidden input field inline.
            if (!this.options.singleField) {
                var escapedValue = label.html();
                tag.append('<input type="hidden" value="' + escapedValue + '" name="' + this.options.fieldName + '" class="tagit-hidden-field" />');
            }

            if (this._trigger('beforeTagAdded', null, {
                tag: tag,
                tagLabel: this.tagLabel(tag),
                duringInitialization: duringInitialization
            }) === false) {
                return;
            }

            if (this.options.singleField) {
                var tags = this.assignedTags();
                tags.push(value);
                this._updateSingleTagsField(tags);
            }

            // DEPRECATED.
            this._trigger('onTagAdded', null, tag);

            this.tagInput.val('');

            // Insert tag.
            this.tagInput.parent().before(tag);

            this._trigger('afterTagAdded', null, {
                tag: tag,
                tagLabel: this.tagLabel(tag),
                duringInitialization: duringInitialization
            });

            if (this.options.showAutocompleteOnFocus && !duringInitialization) {
                setTimeout(function () { that._showAutocomplete(); }, 0);
            }
        },

        removeTag: function(tag, animate) {
            animate = typeof animate === 'undefined' ? this.options.animate : animate;

            tag = $(tag);

            // DEPRECATED.
            this._trigger('onTagRemoved', null, tag);

            if (this._trigger('beforeTagRemoved', null, {tag: tag, tagLabel: this.tagLabel(tag)}) === false) {
                return;
            }

            if (this.options.singleField) {
                var tags = this.assignedTags();
                var removedTagLabel = this.tagLabel(tag);
                tags = $.grep(tags, function(el){
                    return el != removedTagLabel;
                });
                this._updateSingleTagsField(tags);
            }

            if (animate) {
                tag.addClass('removed'); // Excludes this tag from _tags.
                var hide_args = this._effectExists('blind') ? ['blind', {direction: 'horizontal'}, 'fast'] : ['fast'];

                var thisTag = this;
                hide_args.push(function() {
                    tag.remove();
                    thisTag._trigger('afterTagRemoved', null, {tag: tag, tagLabel: thisTag.tagLabel(tag)});
                });

                tag.fadeOut('fast').hide.apply(tag, hide_args).dequeue();
            } else {
                tag.remove();
                this._trigger('afterTagRemoved', null, {tag: tag, tagLabel: this.tagLabel(tag)});
            }

        },

        removeTagByLabel: function(tagLabel, animate) {
            var toRemove = this._findTagByLabel(tagLabel);
            if (!toRemove) {
                throw "No such tag exists with the name '" + tagLabel + "'";
            }
            this.removeTag(toRemove, animate);
        },

        removeAll: function() {
            // Removes all tags.
            var that = this;
            this._tags().each(function(index, tag) {
                that.removeTag(tag, false);
            });
        }

    });
})(jQuery);

