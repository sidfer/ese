import numpy as np
import ssl
import matplotlib.pyplot as plt
from astropy.coordinates import SkyCoord
import astropy.units as u
from astroquery.gaia import Gaia

Gaia.ROW_LIMIT = 250

ra_exo = np.radians(164.8647611)
dec_exo = np.radians(40.4304931)
distance_exo = 13.7967 

x_exo = distance_exo * np.cos(dec_exo) * np.cos(ra_exo)
y_exo = distance_exo * np.cos(dec_exo) * np.sin(ra_exo)
z_exo = distance_exo * np.sin(dec_exo)


ssl._create_default_https_context = ssl._create_unverified_context

# Query Gaia for stars around a given RA/DEC
coord = SkyCoord(ra_exo, dec_exo, unit=(u.degree, u.degree), frame='icrs')
width = u.Quantity(5, u.deg)
height = u.Quantity(5, u.deg)
r = Gaia.query_object_async(coordinate=coord, width=width, height=height)
r.pprint()

# Extract RA, DEC, and parallax from the results
parallax = np.array(r['parallax'])  # in milliarcseconds (mas)
valid_parallax = parallax > 0
ra = np.array(r['ra'])  # in degrees
dec = np.array(r['dec'])  # in degrees
parallax = parallax[valid_parallax]

# Convert parallax to distance in parsecs (1 parsec = 1000 / parallax in mas)
# distance = 1000 / parallax  # distance in parsecs
distance = 1000 / parallax
# Convert RA and DEC from degrees to radians
ra_rad = np.radians(ra)
dec_rad = np.radians(dec)

# Convert RA/DEC/Distance to Cartesian coordinates (x, y, z)
x = distance * np.cos(dec_rad) * np.cos(ra_rad)
y = distance * np.cos(dec_rad) * np.sin(ra_rad)
z = distance * np.sin(dec_rad)

x_relative = x - x_exo
y_relative = y - y_exo
z_relative = z - z_exo


# Plot the point cloud
fig = plt.figure(figsize=(10, 10))
ax = fig.add_subplot(111, projection='3d')
ax.scatter(x_relative, y_relative, z_relative, s=1) 

ax.set_xlabel('X [parsecs]')
ax.set_ylabel('Y [parsecs]')
ax.set_zlabel('Z [parsecs]')
plt.show()
