import 'package:flutter/material.dart';
import 'package:player/layout.dart';
import 'package:provider/provider.dart';

class Side extends StatelessWidget {
  static const name = 'side';

  @override
  Widget build(BuildContext context) {
    final lm = context.watch<LayoutModel>();
    final dim = lm.getSizes(name);
    Size mediaQuery = MediaQuery.of(context).size;
    double sidebarW = mediaQuery.width * dim['w'];
    double sidebarH = mediaQuery.height * dim['h'];
    return Container(
        child: Stack(children: [
      AnimatedPositioned(
          width: sidebarW,
          height: sidebarH,
          duration: Duration(milliseconds: 300),
          curve: Curves.fastOutSlowIn,
          child: Container(
            color: Colors.red,
            child: ListView(
              children: [
                ListTile(
                  leading: Icon(Icons.input),
                  title: Text('Welcome'),
                  onTap: () {
                    print('press');
                    lm.layout = 'wide';
                  },
                ),
                ListTile(
                  leading: Icon(Icons.verified_user),
                  title: Text('Profile'),
                ),
              ],
            ),
          ))
    ]));
  }
}
