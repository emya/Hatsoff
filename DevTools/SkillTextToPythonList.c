#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdlib.h>

int main (int argc, char ** argv) {
	FILE *infp, *outfp;
	char buffer[2560];
	char * end;
	int i = 0;
	if (argc != 3) {
		fprintf (stderr, "usage: %s inputFilename outputFilename\n", argv[0]);
		exit (0);
	}
	infp = fopen (argv[1], "r");
	outfp = fopen (argv[2], "w");
	fprintf (outfp, "{ ");
	if (fscanf (infp, "%[^\r]\n", buffer) == 1) {
		fprintf (outfp, "\"%s\" ", buffer);
	}
	while (fscanf (infp, "%[^\r]\n", buffer) == 1) {
		printf ("line %d\n", i);

		end = buffer + strlen(buffer) - 1;
  		while((end > buffer) && isspace(*end)) 
			{
			*end =0;
			end--;
			};

		
		fprintf (outfp, ", \"%s\"", buffer);
		fflush (outfp);
		if (((++i)&3) == 3)
			fprintf (outfp, "\n");
	}
	fprintf (outfp, "}");
	fclose (outfp);
	fclose (infp);

}

