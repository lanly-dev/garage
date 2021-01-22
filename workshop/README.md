# Windows
Install python via MS Store - python3.8\
'python' command -> latest version if there are multiple versions, use python3.8

## Remove max_path
https://docs.python.org/3/using/windows.html#removing-the-max-path-limitation\
https://superuser.com/questions/1119883/windows-10-enable-ntfs-long-paths-policy-option-missing

# Tensorflow
https://www.tensorflow.org/install/pip#windows
```
python -m venv --system-site-packages .\.venv
.venv\Scripts\activate
deactivate  # don't exit until you're done using TensorFlow
```

## [TensorFlow.js converter](https://github.com/tensorflow/tfjs/tree/master/tfjs-converter)
https://www.tensorflow.org/js/guide/conversion

### Installation
```
pip install tensorflow
pip install tensorflowjs[wizard]
```

### Commands
```bash
tensorflowjs_wizard --dry-run
tensorflowjs_converter --input_format keras path/to/my_model.h5 path/to/tfjs_target_dir
```

# Pip commands
```
pip freeze
pip list
pip install --upgrade pip

# Remove all packages
pip freeze > requirements.txt && pip uninstall -r requirements.txt -y

# Intstall required packages
pip install -r requirements.txt
```

# [JavaScripthon](https://github.com/metapensiero/metapensiero.pj)
```
pip install javascripthon
pj test.py
```
