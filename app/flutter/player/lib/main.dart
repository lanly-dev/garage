import 'dart:io';
import 'package:flutter/material.dart';
import 'package:player/bar.dart';
import 'package:player/focal.dart';
import 'package:player/layout.dart';
import 'package:player/side.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);
  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
      print(Directory.current.path);
      print(_counter);
    });
  }

  @override
  Widget build(BuildContext context) {
    print(Platform());

    return MultiProvider(
        providers: [
          ChangeNotifierProvider(
            create: (context) => LayoutModel(),
          )
        ],
        child: Scaffold(
          appBar: AppBar(
            title: Text(widget.title),
          ),
          body: Stack(children: [Focal(), Side(), Bar()]),
          floatingActionButton: FloatingActionButton(
            onPressed: () {
              _incrementCounter();
              final lm = context.watch<LayoutModel>();
              lm.layout = 'normal';
            },
            tooltip: 'Increment',
            child: Icon(Icons.add),
          ),
        ));
  }
}
