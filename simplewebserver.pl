#Taken from https://renenyffenegger.ch/notes/development/languages/Perl/modules/HTTP/Server/Simple/CGI/webserver  and added minor adaptions
#It is needed in order to run locally a web server for testing this simulator
#Simply execute this perl file.

#!/usr/bin/perl
use warnings; use strict;

use HTTP::Server::Simple::CGI;

{ package WebServer; use base 'HTTP::Server::Simple::CGI';

use File::Slurp; # import read_file

my $nl = "\x0d\x0a";

my $root = '.';
if (@ARGV) {
  $root = shift;
}
chdir($root);

sub print_header { # {{{

    my $content_type = shift;

    print "HTTP/1.0 200 OK$nl";
    print "Content-Type: $content_type; charset=utf-8$nl$nl";

} # }}}

sub serve_file { # {{{

    my $path_relative = shift;
    my $content_type  = shift;

    print_header($content_type);

#    print STDOUT "serve_file: $path_relative\n";

    if (-e $path_relative) {
       print read_file($path_relative, binmode => ":raw");
    }
    else {
       print "file $path_relative not found"; 
    }


} # }}}

sub handle_request { # {{{

    my $self = shift;
    my $cgi  = shift;

    my $path = $cgi -> path_info;

    if ($path eq '/') {
      if (-e 'index.html') {
        serve_file ("index.html", 'text/html');
      }
      else {
        print join "\n", glob('*');
      }
      return;
    }

  #  See http://de.selfhtml.org/diverses/mimetypen.htm for Mime Types.

    if ($path =~ /\.htm$/  or $path =~ /\.html$/) {
      serve_file (".$path", 'text/html');
      return;
    }
    if ($path =~ /\.js$/ ) {
      serve_file (".$path", 'application/javascript');
      return;
    }
    if ($path =~ /\.txt$/) {
      serve_file (".$path", 'text/plain');
      return;
    }
    if ($path =~ /\.js$/ ) {
      serve_file (".$path", 'application/javascript');
      return;
    }
    if ($path =~ /\.png$/) {
      serve_file (".$path", 'image/png');
      return;
    }
    if ($path =~ /\.jpg$/ or $path =~ /\.jpeg/) {
      serve_file (".$path", 'image/jpeg');
      return;
    }
    if ($path =~ /\.ico$/) {
      serve_file (".$path", 'image/x-icon');
      return;
    }
    if ($path =~ /\.css$/) {
      serve_file (".$path", 'text/css');
      return;
    }
    if ($path =~ /\.svg$/) {
      serve_file (".$path", 'image/svg+xml');
      return;
    }

    print STDERR "Unknown Mime type for $path\n";

    serve_file( ".$path", 'text/plain');

} # }}}


}

# Use Port 8080 (http://localhost:8080)
my $pid = WebServer -> new(8080) -> background;
print "pid of webserver=$pid\n";
