import 'package:flutter/material.dart';

class Focal extends StatefulWidget {
  @override
  _FocalState createState() => _FocalState();
}

class _FocalState extends State<Focal> {
  bool isOpen = false;
  @override
  Widget build(BuildContext context) {
    Size mediaQuery = MediaQuery.of(context).size;
    double barW = mediaQuery.width;
    double barH = mediaQuery.height * .15;
    return Container(
        child: Stack(children: [
      AnimatedPositioned(
          width: isOpen ? 50 : barW,
          height: barH,
          top: mediaQuery.height - barH,
          duration: Duration(milliseconds: 300),
          curve: Curves.fastOutSlowIn,
          child: Container(color: Colors.blue))
    ]));
  }
}
