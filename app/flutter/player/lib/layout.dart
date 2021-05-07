import 'package:flutter/foundation.dart';

class LayoutModel extends ChangeNotifier {
  String _layout = 'normal';

  static const _setting = {
    'normal': {
      'bar': {"h": .2, "w": 1},
      'focal': {"h": .8, "w": .8},
      'side': {"h": 1, "w": .2}
    },
    'wide': {
      'bar': {"h": .2, "w": 1},
      'focal': {"h": .8, "w": 1},
      'side': {"h": 0, "w": 0}
    },
    'full': {
      'bar': {"h": 0, "w": 0},
      'focal': {"h": 1, "w": 1},
      'side': {"h": 0, "w": 0}
    }
  };

  set layout(String name) {
    _layout = name;
    notifyListeners();
  }

  Map getSizes(String name) {
    return _setting[_layout][name];
  }
}
