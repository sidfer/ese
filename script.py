import numpy as np
import matplotlib.pyplot as plt
from astropy.coordinates import SkyCoord
import astropy.units as u
from astroquery.gaia import Gaia

# Query Gaia for stars around a given RA/DEC
coord = SkyCoord(ra=185.1787793, dec=17.7932516, unit=(u.degree, u.degree), frame='icrs')
width = u.Quantity(0.1, u.deg)
height = u.Quantity(0.1, u.deg)
r = Gaia.query_object_async(coordinate=coord, width=width, height=height)

# Extract RA, DEC, and parallax from the results
ra = np.array(r['ra'])  # in degrees
dec = np.array(r['dec'])  # in degrees
parallax = np.array(r['parallax'])  # in milliarcseconds (mas)

# Convert parallax to distance in parsecs (1 parsec = 1000 / parallax in mas)
distance = 1000 / parallax  # distance in parsecs

# Convert RA and DEC from degrees to radians
ra_rad = np.radians(ra)
dec_rad = np.radians(dec)

# Convert RA/DEC/Distance to Cartesian coordinates (x, y, z)
x = distance * np.cos(dec_rad) * np.cos(ra_rad)
y = distance * np.cos(dec_rad) * np.sin(ra_rad)
z = distance * np.sin(dec_rad)

# Plot the point cloud
fig = plt.figure(figsize=(10, 10))
ax = fig.add_subplot(111, projection='3d')
ax.scatter(x, y, z, s=1)  # s=1 makes the points small

ax.set_xlabel('X [parsecs]')
ax.set_ylabel('Y [parsecs]')
ax.set_zlabel('Z [parsecs]')
plt.show()
