var SubMenuItem = React.createClass({
  render: function() {
    return (
      <li>
        <a href={this.props.url} alt={this.props.label}>{this.props.label}</a>
      </li>
    );
  }
});

var MenuItem = React.createClass({

  mixins: [
    OnClickOutside,
    React.addons.classSet,
  ],

  // Create this.state.active and set it to false

  getInitialState: function() {
    return {
      active: false,
    };
  },

  // Set this.state.active 'active' to false if a click outside MenuItem occurs

  handleClickOutside: function(evt) {
    this.setState( { active : false } );
  },

  // Toggle this.state.active if MenuItem is clicked on

  handleClick: function(){
    this.setState( { active : !this.state.active } );
  },

  render: function() {

    // Create subMenuItemNode for every object in the array that contains the MenuItem's children

    var subMenuItemNodes = this.props.data.map(function(item, index) {

      // Return each SubMenuItem

      return (
        <SubMenuItem label={item.label} url={item.url} key={index}>
        </SubMenuItem>
      );
    });

    // Check if Menu item has children. If yes, adjust markup to display submenu.

    var label;
    var submenu;

    if (this.props.data.length === 0) {
      label = <a href={this.props.url} alt={this.props.label}>{this.props.label}</a>;
    } else {
      label = <a alt={this.props.label}>{this.props.label}</a>;
      submenu = <ul className='submenu'>{subMenuItemNodes}</ul>;
    };

    // Set classes based on state and 

    var cx = React.addons.classSet;
    var classes = cx({
      'active': this.state.active,
      'parent': this.props.hasChildren === true,
      'childless': this.props.hasChildren === false,
    });

    return (
      <li className={classes} onClick={this.handleClick}>
        {label} 
        {submenu}
      </li>
    );
  }
});

var Menu = React.createClass({
  render: function() {

    // Create menuItemNodes for every object in the array that contains the Menu's children

    var menuItemNodes = this.props.data.map(function(item, index) {

      // Check if MenuItem has children

      var hasChildren;

      if (item.items.length === 0) {
        hasChildren = false
      } else {
        hasChildren = true
      };

      // Return each MenuItem

      return (
        <MenuItem data={item.items} label={item.label} url={item.url} hasChildren={hasChildren} key={index}>
        </MenuItem>
      );
    });

    // Automatically update copyright year

    var year = new Date().getFullYear()

    return (
      <div className='menu-wrapper'>
        <ul className='menu'>
          <li className='desktop-logo'><a href='/#' alt='HUGE'></a></li>
          {menuItemNodes}
          <li className='copyright'>© {year} Huge. All Rights Reserved.</li>
        </ul>
      </div>
    );
  }
});

var Navigation = React.createClass({

  // Ajax in JSON feed that contains the navigation and populate this.state.data with it  

  loadNavigationFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data.items});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  // Create this.state.data

  getInitialState: function() {
    return {data: []};
  },

  // Load navigation initially and update after set intervall 

  componentDidMount: function() {
    this.loadNavigationFromServer();
    setInterval(this.loadNavigationFromServer, this.props.pollInterval);
  },

  render: function() {
    return (
      <nav id="navigation">
        <Menu data={this.state.data} />
      </nav>
    );
  }

});

var Content = React.createClass({

  render: function() {
    return (
      <div className="content">
        <section className="hero">
          <h1>{this.props.claim}</h1>
        </section>

        <section className="copy">
          <h1>{this.props.claim}</h1>
          <p>{this.props.text}</p>
        </section>
      </div>
    );
  }

});

var NavigationToggle = React.createClass({
  render: function() {

    return (
      <div className="bar">
        <div id="toggle" className="toggle"><a alt='Toggle Navigation'></a></div>
        <div id="mobile-logo" className="mobile-logo"><a href="/#"></a></div>
      </div>
    );
  }
});

var App = React.createClass({

  render: function() {
    return (
      <div className='huge-app'>
        <NavigationToggle />
        <Navigation url='http://localhost:3000/api/nav.json' pollInterval={10000} />
        <Content 
          claim='Get payed for giving a shit.' 
          text='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus tempor sagittis quam et ultrices. Mauris molestie orci sed diam cursus ultricies. Nullam placerat dapibus nibh, sed cursus est consectetur sit amet. Phasellus a felis at eros hendrerit ultrices ut sed neque. Aliquam erat volutpat. Suspendisse tortor nibh, suscipit quis augue in, dictum ornare arcu. Aenean congue eget lacus vel sagittis. Vestibulum ultricies pulvinar felis, ut cursus quam gravida quis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus ultricies dictum maximus. Curabitur ut ante ut arcu elementum molestie.' 
        />
        <div id="desktop-overlay" className="desktop-overlay"></div>
        <div id="mobile-overlay" className="mobile-overlay"></div>
      </div>
    );
  }

});

React.render(
  <App />,
  document.getElementById('react-container')
);

// Now the necessary jQuery bits. Reacts unidirectional data flow got in the way of toggling the overlays through component states. I am aware that DOM manipulation is not reccomended with React.js. Setting classes and styles does however not conflict with react-ids and does therefore not cause any problems. For this simple state logic it seemed appropriate to use jQuery. Should the app get more complex Cortex (https://github.com/mquan/cortex) might be worth a look.

$(document).ready(function() {

  // Hide both mobile and desktop overlay on document ready 

  $('#desktop-overlay, #mobile-overlay').hide();

  // Fade in desktop overlay when a menu item with a submenu is clicked

  $('.menu-wrapper').on('click', '.parent', function(){
      $('#desktop-overlay').fadeIn(); 
      $('.bar').addClass('open');
      $('.mobile-overlay').fadeIn();
      $('.menu-wrapper').addClass('visible');
      $('.content').addClass('hidden');   
  }); 

  // Fade out desktop overlay when the same menu item is clicked twice

  $('body').on('click', '.active', function(){
    $('#desktop-overlay').fadeOut();
  });

  // Toggle the off-canvas navigation and all associated classes

  $('body').on('click', '#toggle, #mobile-overlay, #mobile-logo, ul li ul li a, .childless', function(){
    $('.bar').toggleClass('open');
    $('.mobile-overlay').fadeToggle();
    $('.menu-wrapper').toggleClass('visible');
    $('.content').toggleClass('hidden');
  });

});

$(document).mouseup(function (e) {

  // Fade out desktop-overlay if a click occurs outside a parent menu item or its children

  var container = $(".parent");

  if (!container.is(e.target)
    && container.has(e.target).length === 0)
  {
    $('#desktop-overlay').fadeOut();
  }

});



