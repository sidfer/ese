import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Function to simulate a night sky from the exoplanet's perspective
def create_night_sky_image(exoplanet_ra, exoplanet_dec, stars_data, field_of_view=30):
    # Calculate the angular separation of stars from the exoplanet
    stars_data['Angular_Distance'] = np.arccos(
        np.sin(np.radians(exoplanet_dec)) * np.sin(np.radians(stars_data['Dec'])) +
        np.cos(np.radians(exoplanet_dec)) * np.cos(np.radians(stars_data['Dec'])) *
        np.cos(np.radians(stars_data['RA'] - exoplanet_ra))
    ) * (180 / np.pi)  # Convert radians to degrees

    # Filter stars within the field of view
    visible_stars = stars_data[stars_data['Angular_Distance'] <= field_of_view]

    # Create a scatter plot of the visible stars
    plt.figure(figsize=(10, 10))
    plt.subplot(projection='polar')

    # Convert RA to radians for plotting
    visible_stars['RA_Radians'] = np.radians(visible_stars['RA'])
    
    # Scatter plot with brightness affecting the size
    plt.scatter(visible_stars['RA_Radians'], 
                np.pi/2 - np.radians(visible_stars['Dec']),  # Convert Dec to polar coordinates
                s=visible_stars['Brightness'] * 10,  # Scale size for brightness
                c=visible_stars['Brightness'], 
                cmap='viridis', alpha=0.7)

    plt.title(f'Night Sky from Exoplanet at RA: {exoplanet_ra}, Dec: {exoplanet_dec}', va='bottom')
    plt.ylim(0, np.pi/2)  # Limit y-axis

    # Show the plot
    plt.show()

    # Optionally, save the figure
    # plt.savefig('night_sky_exoplanet.png', dpi=300)

# Example star data retrieval (you need to implement this)
def get_stars_around_exoplanet():
    return pd.DataFrame({
        'RA': np.random.uniform(0, 360, 100),  # Right Ascension in degrees
        'Dec': np.random.uniform(-90, 90, 100),  # Declination in degrees
        'Brightness': np.random.uniform(1, 5, 100)  # Arbitrary brightness
    })

# Define the exoplanet's position
exoplanet_ra = 180  # Example RA in degrees
exoplanet_dec = 30  # Example Dec in degrees

# Get star data
stars_data = get_stars_around_exoplanet()

# Create the night sky image
create_night_sky_image(exoplanet_ra, exoplanet_dec, stars_data)
