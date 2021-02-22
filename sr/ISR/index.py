import numpy as np
from PIL import Image

img = Image.open('1st.png')
lr_img = np.array(img)

from ISR.models import RDN
rdn = RDN(weights='psnr-small')
sr_img = rdn.predict(lr_img)
# sr_img = rdn.predict(lr_img, by_patch_of_size=50)
Image.fromarray(sr_img).save('out.png')
